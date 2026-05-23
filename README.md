# Liver Tumor Segmentation - Full Stack Application

A complete full-stack application for liver tumor segmentation using deep learning models including UNet, UNet++, Attention UNet, Trans-UNet, and Ensemble models.

## 🏗️ Architecture

- **Frontend**: Next.js 16 (`liversegpro-frontend/`) — legacy Vite app in `frontend/`
- **Backend**: Spring Boot 3.2 (Java)
- **ML Models**: Python (TensorFlow/PyTorch)

## 📋 Prerequisites

- **Java**: JDK 17 or higher
- **Node.js**: v18 or higher
- **Python**: 3.8 or higher
- **Maven**: 3.6 or higher
- **Angular CLI**: 17

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Start the Frontend

Open a new terminal:

```bash
cd liversegpro-frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

Set `APP_FRONTEND_URL=http://localhost:3000` on the Spring Boot backend for OAuth redirects.

### 4. Access the Application

Open your browser and navigate to `http://localhost:4200`

## 📁 Project Structure

```
LiverTumorSegmentation/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/livertumor/segmentation/
│   │   │   │       ├── config/          # Configuration classes
│   │   │   │       ├── controller/      # REST controllers
│   │   │   │       ├── model/          # Data models
│   │   │   │       └── service/        # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── README.md
│
├── frontend/                   # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # UI components
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── services/       # API services
│   │   ├── assets/
│   │   └── styles.css
│   ├── package.json
│   └── README.md
│
├── ML Models (Jupyter Notebooks)
│   ├── attention.ipynb         # Attention UNet model
│   ├── unet++.ipynb           # UNet++ model
│   ├── train_folder/
│   │   ├── unet.ipynb         # UNet model
│   │   └── unet++.ipynb
│   └── outputs/
│       ├── Ensemble.ipynb     # Ensemble model
│       └── trans-unet.ipynb   # Trans-UNet model
│
├── ml_inference.py            # Python inference script
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🔧 Available Models

1. **UNet** - Classic U-Net architecture
2. **UNet++** - Nested U-Net with dense skip connections
3. **Attention UNet** - U-Net with attention gates
4. **Trans-UNet** - Transformer-based U-Net
5. **Ensemble** - Combination of multiple models

## 🌐 API Endpoints

### Backend REST API (Port 8080)

- `GET /api/health` - Health check
- `GET /api/models` - Get available models
- `POST /api/upload` - Upload image for segmentation
- `POST /api/segment` - Perform segmentation
- `GET /api/images/{fileName}?type={upload|output}` - Retrieve images

## 💻 Development

### Backend Development

```bash
cd backend
mvn spring-boot:run
```

### Frontend Development

```bash
cd frontend
ng serve
```

### Building for Production

**Backend:**
```bash
cd backend
mvn clean package
java -jar target/segmentation-backend-1.0.0.jar
```

**Frontend:**
```bash
cd frontend
ng build --configuration production
```

## 🔌 Integrating ML Models

The `ml_inference.py` script serves as a bridge between the Java backend and Python ML models. To integrate your models:

1. Update `ml_inference.py` with your model loading logic
2. Implement preprocessing and postprocessing steps
3. Ensure the backend's `SegmentationService.java` calls the Python script correctly

Example integration in `SegmentationService.java`:

```java
List<String> command = new ArrayList<>();
command.add("python");
command.add("../ml_inference.py");
command.add("--input");
command.add(imagePath);
command.add("--model");
command.add(modelType);
command.add("--output");
command.add(outputPath);

ProcessBuilder pb = new ProcessBuilder(command);
Process process = pb.start();
```

## 🎨 Features

- ✅ Upload liver scan images
- ✅ Select from 5 different segmentation models
- ✅ Real-time segmentation processing
- ✅ Side-by-side comparison of original and segmented images
- ✅ Responsive modern UI
- ✅ RESTful API architecture
- ✅ CORS configured for cross-origin requests

## 🛠️ Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8080
spring.servlet.multipart.max-file-size=50MB
file.upload-dir=uploads
file.output-dir=outputs
```

### Frontend Configuration

Edit `frontend/src/app/services/segmentation.service.ts`:

```typescript
private apiUrl = 'http://localhost:8080/api';
```

## 📝 Notes

- The current implementation includes a placeholder for ML model integration
- You need to implement the actual model loading and inference in `ml_inference.py`
- Make sure your Jupyter notebooks are converted to Python scripts or modules for production use
- Upload and output directories are created automatically by the backend

## 🐛 Troubleshooting

**Backend won't start:**
- Check if Java 17+ is installed: `java -version`
- Ensure port 8080 is not in use
- Run `mvn clean install` to rebuild

**Frontend won't start:**
- Check if Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Ensure port 4200 is not in use

**CORS errors:**
- Verify the backend is running on port 8080
- Check `CorsConfig.java` allows requests from `http://localhost:4200`

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please create an issue in the repository.

