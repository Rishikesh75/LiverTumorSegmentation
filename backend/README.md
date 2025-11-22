# Liver Tumor Segmentation - Backend

Spring Boot REST API for liver tumor segmentation using various deep learning models.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Python 3.8+ (for ML model inference)

## Available Models

- UNet
- UNet++
- Attention UNet
- Trans-UNet
- Ensemble

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
mvn clean install
```

## Running the Application

### Development Mode

```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

### Production Build

```bash
mvn clean package
java -jar target/segmentation-backend-1.0.0.jar
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Get Available Models
```
GET /api/models
```

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (image file)
```

### Perform Segmentation
```
POST /api/segment
Content-Type: application/json
Body: {
  "imagePath": "uploaded_filename.png",
  "modelType": "unet"
}
```

### Get Image
```
GET /api/images/{fileName}?type=upload|output
```

## Configuration

Edit `src/main/resources/application.properties` to configure:
- Server port
- File upload size limits
- Upload/output directories
- Logging levels

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/livertumor/segmentation/
│   │   │       ├── config/           # Configuration classes
│   │   │       ├── controller/       # REST controllers
│   │   │       ├── model/           # Data models
│   │   │       ├── service/         # Business logic
│   │   │       └── SegmentationApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Testing

```bash
mvn test
```

## License

MIT

