from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
from PIL import Image
import io
import cv2
import base64
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Load the trained model
model = load_model("final_model.keras")  # Update path if needed

# Label mapping
index_to_label = {0: 0, 1: 3, 2: 4}
class_labels = {0: "Normal", 3: "Moderate OA", 4: "Severe OA"}

def preprocess_image(image, target_size=(224, 224)):
    """Preprocess uploaded grayscale image."""
    image = image.convert("L")  # Convert to grayscale
    image = image.resize(target_size)
    image = np.array(image)

    image = image / 255.0  # Normalize
    image = np.expand_dims(image, axis=-1)  # (H, W, 1)
    image = np.expand_dims(image, axis=0)   # (1, H, W, 1)
    return image.astype(np.float32)

def compute_gradcam(model, img_array, last_conv_layer_name="activation_9"):
    """Generate Grad-CAM heatmap for the predicted class."""
    grad_model = Model(
        inputs=model.input,
        outputs=[
            model.get_layer(last_conv_layer_name).output,
            model.output
        ]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        predicted_class = tf.argmax(predictions[0])
        loss = predictions[:, predicted_class]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]  # Remove batch dim
    heatmap = np.zeros(shape=conv_outputs.shape[:-1], dtype=np.float32)

    for i in range(pooled_grads.shape[-1]):
        heatmap += pooled_grads[i] * conv_outputs[:, :, i]

    heatmap = np.maximum(heatmap, 0)
    heatmap /= np.max(heatmap) + 1e-8  # Avoid division by zero
    return heatmap

def overlay_heatmap(image, heatmap, alpha=0.4):
    """Overlay the Grad-CAM heatmap on the grayscale image."""
    image = image.convert("L").resize((224, 224))
    img_array = np.array(image)

    heatmap = cv2.resize(heatmap, (img_array.shape[1], img_array.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    img_color = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
    superimposed_img = cv2.addWeighted(img_color, 1 - alpha, heatmap, alpha, 0)
    return superimposed_img

def encode_image_to_base64(image_array):
    """Encode image array to base64 string."""
    _, buffer = cv2.imencode('.png', image_array)
    return base64.b64encode(buffer).decode('utf-8')

@app.route("/predict", methods=["POST"])
def predict():
    """Handle image prediction and Grad-CAM generation."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    true_class = request.form.get("true_class", None)
    true_class = int(true_class) if true_class is not None else None

    image = Image.open(io.BytesIO(file.read()))
    processed_image = preprocess_image(image, target_size=(224, 224))
    predictions = model.predict(processed_image)[0]

    predicted_index = np.argmax(predictions)
    predicted_class = index_to_label[predicted_index]
    confidence = float(predictions[predicted_index]) * 100

    # Generate Grad-CAM heatmap
    heatmap = compute_gradcam(model, processed_image, last_conv_layer_name="activation_9")
    gradcam_img = overlay_heatmap(image, heatmap)
    heatmap_base64 = encode_image_to_base64(gradcam_img)

    class_probabilities = [
        {"grade": index_to_label[i], "confidence": round(float(prob) * 100, 2)}
        for i, prob in enumerate(predictions)
    ]

    response = {
        "prediction": {
            "grade": predicted_class,
            "label": class_labels[predicted_class],
            "confidence": round(confidence, 2),
            "class_probabilities": class_probabilities,
            "heatmap": heatmap_base64
        }
    }

    return jsonify(response)

if __name__ == "__main__":
    #app.run(debug=True)
    app.run(host="0.0.0.0", port=10000)
