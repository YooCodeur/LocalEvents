import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  Platform,
  FlatList,
  Dimensions,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

interface CapturedPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permission refusée",
          "L'accès à la caméra est nécessaire pour prendre des photos.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo?.uri) {
          const newPhoto: CapturedPhoto = {
            id: Date.now().toString(),
            uri: photo.uri,
            timestamp: Date.now(),
          };
          
          setCapturedPhotos(prev => [newPhoto, ...prev]);
          setShowCamera(false);
        }
      } catch (error) {
        console.error("Erreur lors de la prise de photo:", error);
        Alert.alert("Erreur", "Impossible de prendre la photo");
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission requise",
          "L'accès à la galerie est nécessaire pour sélectionner une photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: CapturedPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          timestamp: Date.now(),
        };
        
        setCapturedPhotos(prev => [newPhoto, ...prev]);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection d'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  const openCamera = () => {
    if (permission?.granted) {
      setShowCamera(true);
    } else {
      requestCameraPermission();
    }
  };

  const deletePhoto = (photoId: string) => {
    setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const clearAllPhotos = () => {
    Alert.alert(
      "Supprimer toutes les photos",
      "Êtes-vous sûr de vouloir supprimer toutes les photos ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: () => setCapturedPhotos([])
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderPhoto = ({ item }: { item: CapturedPhoto }) => {
    const screenWidth = Dimensions.get('window').width;
    const photoWidth = (screenWidth - 48) / 2; // 2 colonnes avec marges
    
    return (
      <View style={[styles.photoItem, { width: photoWidth }]}>
        <Image source={{ uri: item.uri }} style={styles.galleryPhoto} />
        <View style={styles.photoOverlay}>
          <Text style={styles.photoTime}>{formatDate(item.timestamp)}</Text>
          <TouchableOpacity
            style={styles.deletePhotoButton}
            onPress={() => deletePhoto(item.id)}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-outline" size={64} color="#666" />
          <Text style={styles.loadingText}>Chargement de la caméra...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-outline" size={64} color="#666" />
          <Text style={styles.permissionText}>
            Permission d'accès à la caméra requise
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>
              Demander la permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📸 Galerie Photos</Text>
        
        {capturedPhotos.length > 0 ? (
          <View style={styles.galleryContainer}>
            <Text style={styles.photoCount}>
              {capturedPhotos.length} photo{capturedPhotos.length > 1 ? 's' : ''}
            </Text>
            <FlatList
              data={capturedPhotos}
              renderItem={renderPhoto}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.photoRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.galleryList}
            />
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={100} color="#ccc" />
            <Text style={styles.placeholderText}>
              Aucune photo dans la galerie
            </Text>
            <Text style={styles.placeholderSubtext}>
              Commencez par prendre une photo !
            </Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.mainButton, styles.cameraButton]}
            onPress={openCamera}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.mainButtonText}>Prendre une photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainButton, styles.galleryButton]}
            onPress={pickImageFromGallery}
          >
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.mainButtonText}>Choisir de la galerie</Text>
          </TouchableOpacity>

          {capturedPhotos.length > 0 && (
            <TouchableOpacity
              style={[styles.mainButton, styles.deleteAllButton]}
              onPress={clearAllPhotos}
            >
              <Ionicons name="trash" size={24} color="white" />
              <Text style={styles.mainButtonText}>Tout supprimer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#212529",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  capturedImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 20,
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },

  galleryContainer: {
    flex: 1,
    marginBottom: 20,
  },
  photoCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 12,
    textAlign: "center",
  },
  galleryList: {
    paddingBottom: 10,
  },
  photoRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  photoItem: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  galleryPhoto: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "space-between",
    padding: 8,
  },
  photoTime: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
  },
  deletePhotoButton: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    gap: 12,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  cameraButton: {
    backgroundColor: "#007AFF",
  },
  galleryButton: {
    backgroundColor: "#34C759",
  },
  deleteAllButton: {
    backgroundColor: "#FF3B30",
  },
  mainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
}); 