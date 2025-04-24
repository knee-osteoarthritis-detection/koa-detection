from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
from PIL import Image
import io
import cv2
import base64
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

print("🚀 Starting Flask app...")

# Load model with error logging
try:
    model = load_model("final_model.keras")
    print("✅ Model loaded successfully")
except Exception as e:
    print("💥 Error loading model:", e)
    model = None

# Label mappings
index_to_label = {0: 0, 1: 3, 2: 4}
class_labels = {0: "Normal", 3: "Moderate OA", 4: "Severe OA"}

def preprocess_image(image, target_size=(224, 224)):
    image = image.convert("L")
    image = image.resize(target_size)
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=-1)
    image = np.expand_dims(image, axis=0)
    return image.astype(np.float32)

def compute_gradcam(model, img_array, last_conv_layer_name="activation_9"):
    grad_model = Model(
        inputs=model.input,
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        predicted_class = tf.argmax(predictions[0])
        loss = predictions[:, predicted_class]
    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = np.zeros(shape=conv_outputs.shape[:-1], dtype=np.float32)
    for i in range(pooled_grads.shape[-1]):
        heatmap += pooled_grads[i] * conv_outputs[:, :, i]
    heatmap = np.maximum(heatmap, 0)
    heatmap /= np.max(heatmap) + 1e-8
    return heatmap

def overlay_heatmap(image, heatmap, alpha=0.4):
    image = image.convert("L").resize((224, 224))
    img_array = np.array(image)
    heatmap = cv2.resize(heatmap, (img_array.shape[1], img_array.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    img_color = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
    superimposed_img = cv2.addWeighted(img_color, 1 - alpha, heatmap, alpha, 0)
    return superimposed_img

def encode_image_to_base64(image_array):
    _, buffer = cv2.imencode('.png', image_array)
    return base64.b64encode(buffer).decode('utf-8')

@app.route("/", methods=["GET", "HEAD"])
def health_check():
    return "Backend is live!", 200

@app.route("/predict", methods=["POST"])
def predict():
    print("📩 /predict POST request received")

    if model is None:
        print("❌ Model not loaded")
        return jsonify({"error": "Model not available"}), 500

    if "file" not in request.files:
        print("❌ No file in request")
        return jsonify({"error": "No file uploaded"}), 400

    try:
        file = request.files["file"]
        image = Image.open(io.BytesIO(file.read()))
        processed_image = preprocess_image(image)

        print("✅ Image preprocessed")

        predictions = model.predict(processed_image)[0]
        predicted_index = np.argmax(predictions)
        predicted_class = index_to_label[predicted_index]
        confidence = float(predictions[predicted_index]) * 100

        print(f"🔮 Prediction: {predicted_class} ({confidence:.2f}%)")

        heatmap = compute_gradcam(model, processed_image)
        gradcam_img = overlay_heatmap(image, heatmap)
        heatmap_base64 = encode_image_to_base64(gradcam_img)

        class_probabilities = [
            {"grade": index_to_label[i], "confidence": round(float(prob) * 100, 2)}
            for i, prob in enumerate(predictions)
        ]

        return jsonify({
            "prediction": {
                "grade": predicted_class,
                "label": class_labels[predicted_class],
                "confidence": round(confidence, 2),
                "class_probabilities": class_probabilities,
                "heatmap": heatmap_base64
            }
        })

    except Exception as e:
        print("💥 Error during prediction:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
