import open3d as o3d
import numpy as np

def load_point_clouds(data):
    """
    Load point clouds from the provided data format.
    """
    point_clouds = []
    for image in data['images']:
        points = []
        for point_data in image['points']:
            point = [point_data['x'], point_data['y'], point_data['z']]
            points.append(point)
        point_cloud = o3d.geometry.PointCloud()
        point_cloud.points = o3d.utility.Vector3dVector(points)
        point_clouds.append(point_cloud)
    return point_clouds

def register_point_clouds(point_clouds):
    """
    Register consecutive pairs of point clouds using ICP.
    """
    registered_point_clouds = [point_clouds[0]]
    for i in range(1, len(point_clouds)):
        source = registered_point_clouds[-1]
        target = point_clouds[i]
        threshold = 0.2  # Adjust threshold as needed
        reg_p2p = o3d.pipelines.registration.registration_icp(
            source, target, threshold, np.identity(4),
            o3d.pipelines.registration.TransformationEstimationPointToPoint(),
            o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=50)
        )
        source.transform(reg_p2p.transformation)
        registered_point_clouds.append(source)
    return registered_point_clouds

def label_flight_paths(registered_point_clouds):
    """
    Label points across images based on their correspondence.
    """
    labeled_points = {}
    label_count = 0
    for i, point_cloud in enumerate(registered_point_clouds):
        for j, point in enumerate(np.asarray(point_cloud.points)):
            key = tuple(point)
            if key not in labeled_points:
                labeled_points[key] = label_count
                label_count += 1
            else:
                # Update label if point already exists
                labeled_points[key] = min(labeled_points[key], labeled_points[key])
    return labeled_points

def main(data):
    # Load point clouds from data
    point_clouds = load_point_clouds(data)
    
    # Register consecutive point clouds
    registered_point_clouds = register_point_clouds(point_clouds)
    
    # Label flight paths based on correspondence
    labeled_points = label_flight_paths(registered_point_clouds)
    
    # Group points by label
    flight_paths = {}
    for point, label in labeled_points.items():
        if label not in flight_paths:
            flight_paths[label] = []
        flight_paths[label].append(point)
    
    return flight_paths

# Example data
data = {
    "images": [
        {
            "timestamp": 1000,
            "points": [
                {"x": 0.3941006156411847, "y": 2.383493587753968, "z": 0.3403516490596109},
                {"x": -4.706374259463596, "y": -0.6990139241487212, "z": 3.0836905216160617},
                # More points...
            ]
        },
        # More images...
    ]
}

# Run the main function
flight_paths = main(data)
print(flight_paths)




def point_cloud_registration(source_points, target_points, threshold=0.05):
    """
    Perform point cloud registration using feature matching and outlier rejection.

    Parameters:
        source_points (np.ndarray): Array of shape (N, 3) representing points in the source point cloud.
        target_points (np.ndarray): Array of shape (M, 3) representing points in the target point cloud.
        threshold (float): Threshold distance for outlier rejection (default: 0.05).

    Returns:
        transformation (np.ndarray): 4x4 transformation matrix aligning the source point cloud with the target.
    """
    # Convert numpy arrays to Open3D point cloud format
    source_pc = o3d.geometry.PointCloud()
    source_pc.points = o3d.utility.Vector3dVector(source_points)
    target_pc = o3d.geometry.PointCloud()
    target_pc.points = o3d.utility.Vector3dVector(target_points)

    # Compute feature descriptors
    source_feature = o3d.registration.Feature()
    source_feature.set_uniform_feature(0.05)
    source_pc.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
    source_feature.estimate(source_pc)
    target_feature = o3d.registration.Feature()
    target_feature.set_uniform_feature(0.05)
    target_pc.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
    target_feature.estimate(target_pc)

    # Match features
    matcher = o3d.registration.FeatureMatcher()
    matcher.add_feature(source_feature)
    matcher.add_feature(target_feature)
    matches = matcher.apply()

    # Reject outliers using RANSAC
    corres = np.asarray(matches.correspondence_set)
    source_corres = source_points[corres[:, 0]]
    target_corres = target_points[corres[:, 1]]
    transformation = np.eye(4)
    if len(source_corres) >= 3:
        transformation, _ = o3d.registration.registration_ransac_based_on_feature_matching(
            source_pc, target_pc, source_feature, target_feature, matches, 0.05,
            o3d.registration.TransformationEstimationPointToPoint(False), 4, [
                o3d.registration.CorrespondenceCheckerBasedOnEdgeLength(0.9),
                o3d.registration.CorrespondenceCheckerBasedOnDistance(0.05)
            ], o3d.registration.RANSACConvergenceCriteria(4000000, 500))

    return transformation

# Example usage
if __name__ == "__main__":
    # Generate example point clouds
    source_points = np.random.rand(100, 3)  # Source point cloud
    transformation_matrix = np.eye(4)  # Identity transformation initially
    translation = np.array([0.5, 0.5, 0.5])
    rotation_matrix = o3d.geometry.get_rotation_matrix_from_xyz((np.pi / 4, np.pi / 4, np.pi / 4))
    target_points = np.dot(source_points, rotation_matrix.T) + translation  # Transformed source point cloud

    # Perform point cloud registration
    estimated_transformation = point_cloud_registration(source_points, target_points)

    print("Estimated transformation matrix:")
    print(estimated_transformation)
