# import numpy as np

# def calculate_distance(point1, point2):
#     """
#     Calculate Euclidean distance between two points.
#     """
#     return np.linalg.norm(point1[:3] - point2[:3])

# def find_nearest_neighbor(query_point, reference_points, tolerance_distance):
#     """
#     Find the nearest neighbor within a tolerance distance from the query point.
#     """
#     min_distance = float('inf')
#     nearest_neighbor = None
#     for point in reference_points:
#         distance = calculate_distance(query_point, point)
#         if distance < min_distance and distance < tolerance_distance:
#             min_distance = distance
#             nearest_neighbor = point
#     return nearest_neighbor

# def predict_expected_position(point, time_difference, eccentricity=0, semi_major_axis=1):
#     """
#     Predict the expected position of a point based on its speed and time difference,
#     considering the elliptical nature of the orbit with given eccentricity and semi-major axis.
#     """
#     speed = point[3]  # Speed (scalar) stored in the 4th element.
#     position = point[:3]  # Position stored in the first three elements.
    
#     # Calculate the mean anomaly.
#     mean_anomaly = speed * time_difference / semi_major_axis
    
#     # Calculate the eccentric anomaly using numerical methods (e.g., Newton's method).
#     def eccentric_anomaly_solver(mean_anomaly, eccentricity):
#         E0 = mean_anomaly
#         E = E0 - (E0 - eccentricity * np.sin(E0) - mean_anomaly) / (1 - eccentricity * np.cos(E0))
#         while abs(E - E0) > 1e-8:
#             E0 = E
#             E = E0 - (E0 - eccentricity * np.sin(E0) - mean_anomaly) / (1 - eccentricity * np.cos(E0))
#         return E
#     eccentric_anomaly = eccentric_anomaly_solver(mean_anomaly, eccentricity)
    
#     # Calculate the true anomaly.
#     true_anomaly = 2 * np.arctan2(np.sqrt(1 + eccentricity) * np.sin(eccentric_anomaly / 2),
#                                   np.sqrt(1 - eccentricity) * np.cos(eccentric_anomaly / 2))
    
#     # Calculate the distance from the focus (focal distance).
#     r = semi_major_axis * (1 - eccentricity**2) / (1 + eccentricity * np.cos(true_anomaly))
    
#     # Calculate the expected position using polar coordinates.
#     expected_position_polar = (r, true_anomaly)
    
#     # Convert polar coordinates to Cartesian coordinates.
#     expected_position = np.array([
#         expected_position_polar[0] * np.cos(expected_position_polar[1]),
#         expected_position_polar[0] * np.sin(expected_position_polar[1]),
#         0  # Assuming the orbit is in the xy-plane.
#     ])
    
#     return position + expected_position

# def align_point_cloud_icp(points, reference_points, tolerance_distance, max_iterations=100):
#     """
#     Apply Iterative Closest Point (ICP) algorithm to align the point cloud with the reference point cloud.
#     """
#     aligned_points = np.copy(points)
#     for _ in range(max_iterations):
#         # Find correspondences
#         correspondences = {}
#         for point in aligned_points:
#             expected_position = predict_expected_position(point, time_difference)  # Predict expected position based on speed
#             nearest_neighbor = find_nearest_neighbor(expected_position, reference_points, tolerance_distance)
#             if nearest_neighbor is not None:
#                 correspondences[tuple(point)] = nearest_neighbor
        
#         # Compute transformation
#         if len(correspondences) == 0:
#             break  # No correspondences found
#         aligned_points = np.array(list(correspondences.keys()))
#         reference_points = np.array(list(correspondences.values()))
#         transformation = np.linalg.lstsq(aligned_points, reference_points, rcond=None)[0]

#         # Apply transformation
#         aligned_points = np.dot(aligned_points, transformation)
    
#     return aligned_points

# def main(images, tolerance_distance, time_difference):
#     flight_paths = []
#     reference_points = None
#     for image in images:
#         points = np.array([(point['x'], point['y'], point['z'], point['s'], point['C']) for point in image['points']])
#         if reference_points is None:
#             reference_points = points
#         else:
#             aligned_points = align_point_cloud_icp(points, reference_points, tolerance_distance)
#             flight_paths.append(aligned_points)
#     return flight_paths

# # Example usage:
# # images = [
# #     {
# #         "timestamp": 1000,
# #         "points": [
# #             {"x": 0.3941006156411847, "y": 2.383493587753968, "z": 0.3403516490596109, "s": 7, "C": 0.4},
# #             {"x": -4.706374259463596, "y": -0.6990139241487212, "z": 3.0836905216160617, "s": 8, "C": 0.9},
# #             # Add more points...
# #         ]
# #     },
# #     # Add more images...
# # ]

# # tolerance_distance = 0.1  # Define tolerance distance for association
# # time_difference = 1  # Define time difference between consecutive images
# # flight_paths = main(images, tolerance_distance, time_difference)
# # print(flight_paths)



# # import numpy as np

# # def calculate_distance(point1, point2):
# #     """
# #     Calculate Euclidean distance between two points.
# #     """
# #     return np.linalg.norm(point1 - point2)

# # def find_nearest_neighbor(query_point, reference_points, tolerance_distance):
# #     """
# #     Find the nearest neighbor within a tolerance distance from the query point.
# #     """
# #     min_distance = float('inf')
# #     nearest_neighbor = None
# #     for point in reference_points:
# #         distance = calculate_distance(query_point, point)
# #         if distance < min_distance and distance < tolerance_distance:
# #             min_distance = distance
# #             nearest_neighbor = point
# #     return nearest_neighbor

# # def align_point_cloud_icp(points, reference_points, tolerance_distance, max_iterations=100):
# #     """
# #     Apply Iterative Closest Point (ICP) algorithm to align the point cloud with the reference point cloud.
# #     """
# #     aligned_points = np.copy(points)
# #     for _ in range(max_iterations):
# #         # Find correspondences
# #         correspondences = {}
# #         for point in aligned_points:
# #             expected_position = point[:3] + point[3] * point[3] * np.cross(point[:3], [0, 0, 1])  # Assuming circular motion
# #             nearest_neighbor = find_nearest_neighbor(expected_position, reference_points, tolerance_distance)
# #             if nearest_neighbor is not None:
# #                 correspondences[tuple(point)] = nearest_neighbor
        
# #         # Compute transformation
# #         if len(correspondences) == 0:
# #             break  # No correspondences found
# #         aligned_points = np.array(list(correspondences.keys()))
# #         reference_points = np.array(list(correspondences.values()))
# #         transformation = np.linalg.lstsq(aligned_points, reference_points, rcond=None)[0]

# #         # Apply transformation
# #         aligned_points = np.dot(aligned_points, transformation)
    
# #     return aligned_points

# # def main(images, tolerance_distance):
# #     flight_paths = []
# #     reference_points = None
# #     for image in images:
# #         points = np.array([(point['x'], point['y'], point['z'], point['s'], point['C']) for point in image['points']])
# #         if reference_points is None:
# #             reference_points = points
# #         else:
# #             aligned_points = align_point_cloud_icp(points, reference_points, tolerance_distance)
# #             flight_paths.append(aligned_points)
# #     return flight_paths

# # # Example usage:
# # images = [
# #     {
# #         "timestamp": 1000,
# #         "points": [
# #             {"x": 0.3941006156411847, "y": 2.383493587753968, "z": 0.3403516490596109, "s": 7, "C": 0.4},
# #             {"x": -4.706374259463596, "y": -0.6990139241487212, "z": 3.0836905216160617, "s": 8, "C": 0.9},
# #             # Add more points...
# #         ]
# #     },
# #     # Add more images...
# # ]

# # tolerance_distance = 0.1  # Define tolerance distance for association
# # flight_paths = main(images, tolerance_distance)
# # print(flight_paths)
