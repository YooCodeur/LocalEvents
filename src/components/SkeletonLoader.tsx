import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
  height?: number;
  width?: string | number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = 20,
  width = '100%',
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e9ecef', '#f8f9fa'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Composant pour skeleton d'événement
export const EventSkeleton: React.FC = () => (
  <View style={styles.eventSkeletonCard}>
    <SkeletonLoader height={80} width={80} borderRadius={8} />
    <View style={styles.eventSkeletonInfo}>
      <SkeletonLoader height={18} width="90%" borderRadius={4} style={{ marginBottom: 8 }} />
      <SkeletonLoader height={14} width="70%" borderRadius={4} style={{ marginBottom: 6 }} />
      <SkeletonLoader height={14} width="60%" borderRadius={4} style={{ marginBottom: 6 }} />
      <SkeletonLoader height={12} width="50%" borderRadius={4} />
    </View>
    <View style={styles.eventSkeletonFavorite}>
      <SkeletonLoader height={24} width={24} borderRadius={12} />
    </View>
  </View>
);

// Composant pour liste de skeletons
export const EventsSkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View style={styles.skeletonList}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index}>
        <EventSkeleton />
        {index < count - 1 && <View style={styles.skeletonSeparator} />}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e9ecef',
  },
  eventSkeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventSkeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventSkeletonFavorite: {
    padding: 8,
  },
  skeletonList: {
    padding: 16,
  },
  skeletonSeparator: {
    height: 12,
  },
}); 