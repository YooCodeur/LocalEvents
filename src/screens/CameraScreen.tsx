import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  FlatList,
  Dimensions,
  Modal,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface CapturedPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

const CameraScreen = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [cameraKey, setCameraKey] = useState(0); // Clé pour forcer le re-render
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Forcer le re-render de la caméra quand les permissions changent
  useEffect(() => {
    if (permission?.granted) {
      // Délai court pour laisser le temps aux permissions de se propager sur iOS
      const timeoutId = setTimeout(() => {
        setCameraKey((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [permission?.granted]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        if (photo) {
          const newPhoto: CapturedPhoto = {
            id: Date.now().toString(),
            uri: photo.uri,
            timestamp: Date.now(),
          };

          setCapturedPhotos((prev) => [newPhoto, ...prev]);
        }
      } catch (error) {
        console.error("Erreur lors de la prise de photo:", error);
        Alert.alert("Erreur", "Impossible de prendre la photo");
      }
    }
  };

  const deletePhoto = (id: string) => {
    Alert.alert(
      "Supprimer la photo",
      "Êtes-vous sûr de vouloir supprimer cette photo ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () =>
            setCapturedPhotos((prev) =>
              prev.filter((photo) => photo.id !== id),
            ),
        },
      ],
    );
  };

  const deleteAllPhotos = () => {
    if (capturedPhotos.length === 0) return;

    Alert.alert(
      "Supprimer toutes les photos",
      `Êtes-vous sûr de vouloir supprimer les ${capturedPhotos.length} photos ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Tout supprimer",
          style: "destructive",
          onPress: () => setCapturedPhotos([]),
        },
      ],
    );
  };

  const renderPhoto = ({ item }: { item: CapturedPhoto }) => (
    <View style={styles.photoContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.uri }} style={styles.photo} />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePhoto(item.id)}
        >
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="camera-outline" size={80} color="#ccc" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={120} color="#007AFF" />
          <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
          <Text style={styles.permissionText}>
            Cette application a besoin d'accéder à votre caméra pour prendre des
            photos.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        key={cameraKey}
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />

      <View style={styles.overlay}>
        <SafeAreaView style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => setShowGallery(true)}
            >
              <Ionicons name="images" size={24} color="white" />
              {capturedPhotos.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{capturedPhotos.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.photoCount}>
            📸 {capturedPhotos.length} photo
            {capturedPhotos.length !== 1 ? "s" : ""}
          </Text>
        </SafeAreaView>

        <SafeAreaView style={styles.bottomControls}>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <Modal
        visible={showGallery}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.galleryModal}>
          <View style={styles.galleryHeader}>
            <TouchableOpacity onPress={() => setShowGallery(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.galleryTitle}>Photos capturées</Text>
            </View>
          </View>

          {capturedPhotos.length > 0 ? (
            <>
              <FlatList
                data={capturedPhotos}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.photoGrid}
              />

              {/* Footer avec bouton supprimer */}
              <View style={styles.galleryFooter}>
                <TouchableOpacity
                  style={styles.deleteAllButtonBottom}
                  onPress={deleteAllPhotos}
                >
                  <Text style={styles.deleteAllButtonText}>Tout supprimer</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyGallery}>
              <Ionicons name="camera-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>Aucune photo</Text>
              <Text style={styles.emptySubtext}>
                Prenez une photo pour commencer
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 15,
  },
  headerLeft: {
    minWidth: 75,
    alignItems: "flex-start",
  },

  galleryButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginLeft: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  photoCount: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomControls: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  captureButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 6,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "white",
  },
  controlButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 40,
    bottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Modal Galerie
  galleryModal: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryFooter: {
    paddingHorizontal: 30,
    paddingTop: 18,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "white",
  },
  photoGrid: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },
  photoContainer: {
    flex: 1,
    margin: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: (width - 60) / 2,
    height: (width - 60) / 2,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 15,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  timestamp: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    fontWeight: "500",
  },
  emptyGallery: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: "#ccc",
    marginTop: 15,
    fontWeight: "500",
    textAlign: "center",
  },

  // Permissions
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 22,
    color: "#007AFF",
    marginTop: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  message: {
    textAlign: "center",
    paddingBottom: 15,
    paddingHorizontal: 30,
    color: "white",
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 12,
    alignSelf: "center",
    marginHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteAllButtonBottom: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignSelf: "center",
  },
  deleteAllButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CameraScreen;
