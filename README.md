# Knee Osteoarthritis Detection System

A web-based application for automated detection and grading of knee osteoarthritis (KOA) from X-ray images using deep learning. The web-app also deployed in local [Docker](https://www.docker.com/products/docker-desktop/).

## Features

- Upload and analyze knee X-ray images.
- Automated detection of osteoarthritis severity using KL grades (0, 3, 4).
- Real-time processing and results visualization.
- User-friendly interface and export initial analysis report.
- High accuracy performance (95% overall accuracy)

## Architecture of the proposed system

![arch](images/architecture.png)

## Hydride Deep learning model

![arch](images/model_arch.png)

### Frontend

- React + Vite + TypeScript
- Tailwind CSS for styling
- shadcn-ui components
- Responsive and intuitive user interface

### Backend

- Flask-python RESTful API
- Deep learning model integration
- Image preprocessing pipeline
- Secure file handling and validation

### Model Architecture

- Modified ResNet with attention mechanisms
- Input size: 224 × 224 pixels
- 42 convolutional layers
- 1,779,231 parameters (6.79 MB)
- Trained on 3,000 X-ray images obtained from [Mendeley Data](https://data.mendeley.com/datasets/56rmx5bjcr/1)

## Performance Metrics

- Overall Accuracy: 95.0%
- F1 Score: 0.95
- Precision: 0.95
- Recall: 0.95

## Installation step-by-step

### Prerequisites

- Node.js
- Python 3.8+ (for backend)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/knee-osteoarthritis-detection/koa-detection.git
```

2. Install frontend dependencies:

```sh
cd koa-detection
npm install
```

3. Install backend dependencies:

```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Start the development servers:

Frontend:

```sh
npm run dev
```

Backend:

```sh
cd backend
python app.py
```

## Usage

1. Access the web interface through your browser at `http://localhost:5173`
2. Upload a knee X-ray image
3. Wait for the automated analysis
4. View the detailed results and KL grade classification

## Development

This project uses:

- Vite for frontend tooling
- TypeScript for type safety
- React for UI components
- shadcn-ui for component library
- Tailwind CSS for styling

## Deployment

You can deploy this project using various platforms:

### Frontend Deployment

- Vercel
- Netlify
- GitHub Pages
- AWS Amplify

### Backend Deployment

- Heroku
- AWS Elastic Beanstalk
- Google Cloud Platform
- DigitalOcean

Make sure to set up the necessary environment variables and update the API endpoints accordingly.

## Team

Our team consists of experienced developers and medical imaging experts. Visit the Team page in the application to learn more about the contributors.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
