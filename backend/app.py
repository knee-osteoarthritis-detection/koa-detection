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
    arr = np.array(image) / 255.0
    arr = np.expand_dims(arr, axis=-1)
    arr = np.expand_dims(arr, axis=0)
    return arr.astype(np.float32)

def compute_gradcam(model, img_array, last_conv_layer_name="activation_9"):
    grad_model = Model(
        inputs=model.input,
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        pred_class = tf.argmax(predictions[0])
        loss = predictions[:, pred_class]
    grads = tape.gradient(loss, conv_outputs)
    pooled = tf.reduce_mean(grads, axis=(0,1,2))
    conv_outputs = conv_outputs[0]
    heatmap = np.zeros(conv_outputs.shape[:-1], dtype=np.float32)
    for i in range(pooled.shape[-1]):
        heatmap += pooled[i] * conv_outputs[:,:,i]
    heatmap = np.maximum(heatmap, 0)
    heatmap /= np.max(heatmap) + 1e-8
    return heatmap

def overlay_heatmap(image, heatmap, alpha=0.4):
    image = image.convert("L").resize((224,224))
    img_arr = np.array(image)
    heatmap = cv2.resize(heatmap, (img_arr.shape[1], img_arr.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    img_color = cv2.cvtColor(img_arr, cv2.COLOR_GRAY2BGR)
    return cv2.addWeighted(img_color, 1-alpha, heatmap, alpha, 0)

def encode_image_to_base64(img_arr):
    _, buf = cv2.imencode('.png', img_arr)
    return base64.b64encode(buf).decode('utf-8')

@app.route("/", methods=["GET", "HEAD"])
def health_check():
    return "Backend is live!", 200

@app.route("/predict", methods=["POST"])
def predict():
    print("📩 /predict called")

    if model is None:
        print("❌ Model not loaded")
        return jsonify({"error": "Model not available"}), 500

    if "file" not in request.files:
        print("❌ No file part")
        return jsonify({"error": "No file uploaded"}), 400

    try:
        file = request.files["file"]
        print(f"📂 Received file: {file.filename}")

        image = Image.open(io.BytesIO(file.read()))
        proc = preprocess_image(image)
        print("✅ Image preprocessed")

        preds = model.predict(proc)[0]
        print("🧠 Model prediction done")

        idx = np.argmax(preds)
        grade = index_to_label[idx]
        conf = float(preds[idx]) * 100
        print(f"🔮 Predicted grade {grade} ({conf:.2f}%)")

        heatmap = compute_gradcam(model, proc)
        overlay = overlay_heatmap(image, heatmap)
        heatmap_b64 = encode_image_to_base64(overlay)
        print("🔥 Grad-CAM generated")

        probs = [
            {"grade": index_to_label[i], "confidence": round(float(p)*100,2)}
            for i,p in enumerate(preds)
        ]

        return jsonify({
            "prediction": {
                "grade": grade,
                "label": class_labels[grade],
                "confidence": round(conf,2),
                "class_probabilities": probs,
                "heatmap": heatmap_b64
            }
        })
    except Exception as e:
        print("💥 Error in /predict:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT"))
    app.run(host="0.0.0.0", port=port)
