import numpy as np
from scipy.spatial import KDTree
from typing import List, Tuple

def apply_icp_algorithm(Pj: np.ndarray, Pref: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
     Point Cloud Registration:
        • Given two point clouds Pj and Pref, where each point is represented as pi and Gref, k respectively.
        • The goal is to find the optimal transformation I; that aligns P; with Pref by minimizing the distance between corresponding points.
        • Let Pij and Gref,k represent the Cartesian coordinates of points pij and ref,k respectively.
        • The transformation Ti consists of rotation matrix R.; and translation vector tj
        • We aim to find R; and t; that minimize the error metric, typically the sum of squared differences between corresponding points:
            E(Ri,tj) = Σ(||R * pi + t - Gref,k||^2), where k(j) denotes the index of the nearest neighbor of pi in Pref.*
        • The transformation I; that minimizes E(Ri, ti) can be estimated iteratively using methods such as least squares fitting or
          Singular Value Decomposition (SVD).
        • Predicting Expected Positions based on Speed:
        • Given a point Pij with speed sij in image i, and assuming a constant speed model, the expected position pi, in the reference
          image ref after time Δt can be predicted using:
            Pig = Pij + sij * Vij * Δt
        • Here, Vij is the unit vector representing the direction of motion of Pij.
        • Searching for Nearest Neighbors within Tolerance Distance:
        • To associate points between Pj and Pref, we search for the nearest neighbor gref, (·), in Pref within a tolerance distance
          { (zeta) around the predicted position Pij.
            If || Gref,k - Pig || < tolerance, then Pij is associated with Gref,k(j).*

    Args:
        Pj (np.ndarray): Point cloud Pj.
        Pref (np.ndarray): Reference point cloud Pref.

    Returns:
        Tuple[np.ndarray, np.ndarray]: Tuple containing the rotation matrix R and translation vector t.
    """
    # Initial transformation guess?
    R = np.eye(3)
    t = np.zeros((3, 1))

    for _ in range(max_iterations):
        # Apply current transformation to Pj
        Pj_transformed = np.dot(R, Pj.T) + t

        # Find nearest neighbors in Pref for each point in Pj
        tree = KDTree(Pref.T)
        _, nearest_indices = tree.query(Pj_transformed.T)

        # Compute centroids
        centroid_Pj = np.mean(Pj, axis=0)
        centroid_Pref = np.mean(Pref[nearest_indices], axis=0)

        # Compute cross-covariance matrix
        H = np.dot((Pj - centroid_Pj).T, Pref[nearest_indices] - centroid_Pref)

        # Singular Value Decomposition
        U, _, Vt = np.linalg.svd(H)

        # Compute rotation matrix
        R_new = np.dot(Vt.T, U.T)

        # Compute translation vector
        t_new = centroid_Pref.T - np.dot(R_new, centroid_Pj.T)

        # Update transformation
        delta_R = R_new - R
        delta_t = t_new - t
        R = R_new
        t = t_new

        # Check for convergence
        if np.linalg.norm(delta_R) < tolerance and np.linalg.norm(delta_t) < tolerance:
            break

    return R, t


def predict_expected_positions(Pij: np.ndarray, sij: np.ndarray, Vij: np.ndarray, delta_t: float) -> np.ndarray:
    """
    Predict the expected positions based on speed.

    Args:
        Pij (np.ndarray): Array of Cartesian coordinates of points Pij.
        sij (np.ndarray): Array of speeds for points Pij.
        Vij (np.ndarray): Array of unit vectors representing the direction of motion of points Pij.
        delta_t (float): Time interval.

    Returns:
        np.ndarray: Array of predicted expected positions.
    """
    # Predicted expected positions based on constant speed model
    return Pij + sij[:, np.newaxis] * Vij * delta_t

def search_nearest_neighbors(Pj: np.ndarray, Pref: np.ndarray, tolerance: float) -> List[Tuple[np.ndarray, np.ndarray]]:
    """
    Search for nearest neighbors within tolerance distance.

    Args:
        Pj (np.ndarray): Point cloud Pj.
        Pref (np.ndarray): Reference point cloud Pref.
        tolerance (float): Tolerance distance.

    Returns:
        List[Tuple[np.ndarray, np.ndarray]]: List of tuples containing associated points.
    """
    # Build KDTree from reference point cloud
    tree = KDTree(Pref)

    # Search for nearest neighbors for each point in Pj
    nearest_indices = tree.query_ball_point(Pj, tolerance)

    # Associate points within tolerance distance
    associated_points = [(Pj[i], Pref[indices]) for i, indices in enumerate(nearest_indices)]

    return associated_points

def cloud(images: List[dict], delta_t: float = 1.0, tolerance: float = 5.0) -> List[List[Tuple[float, float, float, float, float, float]]]:
    """
    Main function to execute the entire process.

    Args:
        images (List[dict]): List of images with points data.
        delta_t (float): Time interval for predicting expected positions.
        tolerance (float): Tolerance distance for searching nearest neighbors.

    Returns:
        List[List[Tuple[float, float, float, float, float, float]]]: List of flight paths
            represented as tuples of (x, y, z, s, C, t) for associated points.
    """
    # Placeholder for flight paths
    flight_paths = []

    # Iterate over images
    for image in images:
        # Extract point cloud data from the image
        point_cloud = np.array([point['coordinates'] for point in image['points']])
        speeds = np.array([point['speed'] for point in image['points']])
        directions = np.array([point['direction'] for point in image['points']])

        # Predict expected positions based on speed
        predicted_positions = predict_expected_positions(point_cloud, speeds, directions, delta_t)

        # Search for nearest neighbors within tolerance distance
        associated_points = search_nearest_neighbors(predicted_positions, point_cloud, tolerance)

        # Append associated points to flight paths
        for associated_point in associated_points:
            # Extract coordinates, speed, confidence score, and timestamp
            x, y, z = associated_point[0]
            s = speeds[np.where((point_cloud == associated_point[1]).all(axis=1))][0]
            C = associated_point[1]['confidence']
            t = image['timestamp']

            # Append to flight paths
            flight_paths.append((x, y, z, s, C, t))

    return flight_paths

# Example usage:
if __name__ == "__main__":
    images_data = [...]  # List of images with points data
    flight_paths = cloud(images_data)
    for path in flight_paths:
        print(path)

# import open3d as o3d
# import numpy as np

# def load_point_clouds(data):
#     """
#     Load point clouds from the provided data format.
#     """
#     point_clouds = []
#     for image in data['images']:
#         points = []
#         for point_data in image['points']:
#             point = [point_data['x'], point_data['y'], point_data['z']]
#             points.append(point)
#         point_cloud = o3d.geometry.PointCloud()
#         point_cloud.points = o3d.utility.Vector3dVector(points)
#         point_clouds.append(point_cloud)
#     return point_clouds

# def register_point_clouds(point_clouds):
#     """
#     Register consecutive pairs of point clouds using ICP.
#     """
#     registered_point_clouds = [point_clouds[0]]
#     for i in range(1, len(point_clouds)):
#         source = registered_point_clouds[-1]
#         target = point_clouds[i]
#         threshold = 0.2  # Adjust threshold as needed
#         reg_p2p = o3d.pipelines.registration.registration_icp(
#             source, target, threshold, np.identity(4),
#             o3d.pipelines.registration.TransformationEstimationPointToPoint(),
#             o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=50)
#         )
#         source.transform(reg_p2p.transformation)
#         registered_point_clouds.append(source)
#     return registered_point_clouds

# def label_flight_paths(registered_point_clouds):
#     """
#     Label points across images based on their correspondence.
#     """
#     labeled_points = {}
#     label_count = 0
#     for i, point_cloud in enumerate(registered_point_clouds):
#         for j, point in enumerate(np.asarray(point_cloud.points)):
#             key = tuple(point)
#             if key not in labeled_points:
#                 labeled_points[key] = label_count
#                 label_count += 1
#             else:
#                 # Update label if point already exists
#                 labeled_points[key] = min(labeled_points[key], labeled_points[key])
#     return labeled_points

# def main(data):
#     # Load point clouds from data
#     point_clouds = load_point_clouds(data)
    
#     # Register consecutive point clouds
#     registered_point_clouds = register_point_clouds(point_clouds)
    
#     # Label flight paths based on correspondence
#     labeled_points = label_flight_paths(registered_point_clouds)
    
#     # Group points by label
#     flight_paths = {}
#     for point, label in labeled_points.items():
#         if label not in flight_paths:
#             flight_paths[label] = []
#         flight_paths[label].append(point)
    
#     return flight_paths

# # Example data
# data = {
#     "images": [
#         {
#             "timestamp": 1000,
#             "points": [
#                 {"x": 0.3941006156411847, "y": 2.383493587753968, "z": 0.3403516490596109},
#                 {"x": -4.706374259463596, "y": -0.6990139241487212, "z": 3.0836905216160617},
#                 # More points...
#             ]
#         },
#         # More images...
#     ]
# }

# # Run the main function
# flight_paths = main(data)
# print(flight_paths)




# def point_cloud_registration(source_points, target_points, threshold=0.05):
#     """
#     Perform point cloud registration using feature matching and outlier rejection.

#     Parameters:
#         source_points (np.ndarray): Array of shape (N, 3) representing points in the source point cloud.
#         target_points (np.ndarray): Array of shape (M, 3) representing points in the target point cloud.
#         threshold (float): Threshold distance for outlier rejection (default: 0.05).

#     Returns:
#         transformation (np.ndarray): 4x4 transformation matrix aligning the source point cloud with the target.
#     """
#     # Convert numpy arrays to Open3D point cloud format
#     source_pc = o3d.geometry.PointCloud()
#     source_pc.points = o3d.utility.Vector3dVector(source_points)
#     target_pc = o3d.geometry.PointCloud()
#     target_pc.points = o3d.utility.Vector3dVector(target_points)

#     # Compute feature descriptors
#     source_feature = o3d.registration.Feature()
#     source_feature.set_uniform_feature(0.05)
#     source_pc.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
#     source_feature.estimate(source_pc)
#     target_feature = o3d.registration.Feature()
#     target_feature.set_uniform_feature(0.05)
#     target_pc.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
#     target_feature.estimate(target_pc)

#     # Match features
#     matcher = o3d.registration.FeatureMatcher()
#     matcher.add_feature(source_feature)
#     matcher.add_feature(target_feature)
#     matches = matcher.apply()

#     # Reject outliers using RANSAC
#     corres = np.asarray(matches.correspondence_set)
#     source_corres = source_points[corres[:, 0]]
#     target_corres = target_points[corres[:, 1]]
#     transformation = np.eye(4)
#     if len(source_corres) >= 3:
#         transformation, _ = o3d.registration.registration_ransac_based_on_feature_matching(
#             source_pc, target_pc, source_feature, target_feature, matches, 0.05,
#             o3d.registration.TransformationEstimationPointToPoint(False), 4, [
#                 o3d.registration.CorrespondenceCheckerBasedOnEdgeLength(0.9),
#                 o3d.registration.CorrespondenceCheckerBasedOnDistance(0.05)
#             ], o3d.registration.RANSACConvergenceCriteria(4000000, 500))

#     return transformation

# # Example usage
# if __name__ == "__main__":
#     # Generate example point clouds
#     source_points = np.random.rand(100, 3)  # Source point cloud
#     transformation_matrix = np.eye(4)  # Identity transformation initially
#     translation = np.array([0.5, 0.5, 0.5])
#     rotation_matrix = o3d.geometry.get_rotation_matrix_from_xyz((np.pi / 4, np.pi / 4, np.pi / 4))
#     target_points = np.dot(source_points, rotation_matrix.T) + translation  # Transformed source point cloud

#     # Perform point cloud registration
#     estimated_transformation = point_cloud_registration(source_points, target_points)

#     print("Estimated transformation matrix:")
#     print(estimated_transformation)
