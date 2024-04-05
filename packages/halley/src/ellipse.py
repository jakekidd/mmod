import numpy as np
from scipy.optimize import minimize
from typing import Union

# TODO: move
PARITY = 60 * 60 # Parity between images in seconds.
CONVERSION_RATIO = 1.0 # Conversion ratio by which to normalize coordinates.

# TODO: Gather statistical resources to cite for the common values listed here for these to orient around.
"""
Reasoning Behind Initial Guesses:
    Semi-Major Axis (a):
    For space debris, semi-major axis typically falls within a certain range, depending on the altitude of the orbit.
    For Low Earth Orbits (LEO), semi-major axis can range from about 160 km (minimum altitude for stable orbit) to 2000 km (typical altitude for LEO satellites).
    We can use the median value within the expected range as an initial guess.

    Semi-Minor Axis (b):
    The semi-minor axis is related to the semi-major axis by the eccentricity of the orbit. Since we don't know the eccentricity yet, we can't directly estimate
    the semi-minor axis. However, we can use the same order of magnitude as the semi-major axis for the initial guess, since the shape of the orbit is typically
    close to being circular or slightly elliptical. We guessed 80% of semi-major.

    Eccentricity (e):
    Eccentricity describes how circular or elliptical the orbit is. For most artificial satellites, eccentricity is relatively low, typically ranging from 0 to 0.3.
    We can use a conservative estimate of 0.1 for the initial guess.

    Orientation (θ):
    Orientation describes the rotational position of the orbit within its plane, often represented by the argument of periapsis.
    Since we don't have specific information about the orientation without further data or constraints, we can provide a random initial guess, such as 0 degrees.
    If we assume that a significant portion of orbital debris orbits are aligned with or near the equatorial plane, we can approximate the orientation in terms of
    as centered around 0 degrees.
"""
[
    INIT_GUESS_SEMI_MAJOR,
    INIT_GUESS_SEMI_MINOR,
    INIT_GUESS_ECCENTRICITY,
    INIT_GUESS_ORIENTATION
] = [1080, 864, 0.1, 0]

def preprocess_data(flight_path):
    """
    Preprocess flight path data.
    Normalize coordinates, estimate speed, and calculate confidence score modifier.
    """
    # Normalize coordinates
    # You can implement normalization here
    
    # Estimate speed
    # You can implement speed estimation here
    
    # Calculate confidence score modifier
    # You can implement confidence score modifier calculation (alpha, beta distribution) here
    
    # Initialize lists to store processed data
    normalized_flight_path = []
    confidence_score_modifiers = []
    
    # Iterate over each data point in the flight path
    for data_point in flight_path:
        # Extract coordinates (x, y, z), speed (s), time (t), and confidence score (C)
        x, y, z = data_point['x'], data_point['y'], data_point['z']
        speed = data_point['s']
        time = data_point['t']
        confidence_score = data_point['C']
        
        # Normalize coordinates (assuming conversion ratio from original units to kilometers)
        normalized_x = x * conversion_ratio
        normalized_y = y * conversion_ratio
        normalized_z = z * conversion_ratio
        
        # Calculate confidence score modifier (you can adjust this based on your model)
        confidence_score_modifier = confidence_score
        
        # TODO: Maybe just modify in-place?
        # Append processed data to lists
        normalized_flight_path.append({'x': normalized_x, 'y': normalized_y, 'z': normalized_z, 's': speed, 't': time})
        confidence_score_modifiers.append(confidence_score_modifier)
    
    return normalized_flight_path, confidence_score_modifiers

def estimate_parameters(flight_path, estimated_speeds):
    """
    Estimate ellipse parameters.
    """
    # Initial guess for ellipse parameters
    # You can use the Earth's radius to estimate initial parameters
    
    # Optimization function (minimize error)
    # You can use scipy's minimize function
    
    # Optimize ellipse parameters
    # You can optimize parameters using nonlinear least squares
    
    # Initial guess for ellipse parameters
    initial_parameters = [
        INIT_GUESS_SEMI_MAJOR,
        INIT_GUESS_SEMI_MINOR,
        INIT_GUESS_ECCENTRICITY,
        INIT_GUESS_ORIENTATION
    ]
    
    # Optimization function (minimize error)
    def optimization_function(parameters):
        # Calculate error for given parameters
        error = calculate_error(parameters, flight_path, estimated_speeds)
        return error
    
    # Optimize ellipse parameters
    optimized_result = minimize(optimization_function, initial_parameters, method='Nelder-Mead')  # You can choose the appropriate optimization method
    
    # Extract optimized parameters
    optimized_parameters = optimized_result.x
    
    return optimized_parameters


def calculate_error(parameters, flight_path, confidence_score_modifiers, expected_eccentricity, beta):
    """
    Calculate error for the fitted ellipse.
    """
    # Extract ellipse parameters.
    semi_major_axis, eccentricity, orientation = parameters
    
    # Calculate predicted positions based on ellipse parameters.
    predicted_positions = []  # List to store predicted positions.
    
    for data_point in flight_path:
        # Extract coordinates (x, y, z), speed (s), and time (t).
        x, y, z = data_point['x'], data_point['y'], data_point['z']
        speed = data_point['s']
        time = data_point['t']

        # TODO: Proximity threshold mod should be a configurable constant.
        # Estimate orbital period.
        orbital_period = estimate_orbital_period(flight_path, 1.0)
        
        # Calculate mean anomaly (M) using the formula: M = (2π / T) * t, where T is the orbital period.
        mean_anomaly = (2 * np.pi / orbital_period) * time
        
        # Calculate eccentric anomaly (E) using an iterative method.
        eccentric_anomaly = mean_anomaly
        max_iterations = 1000  # Maximum number of iterations.
        tolerance = 1e-6  # Convergence tolerance.
        for _ in range(max_iterations):
            next_eccentric_anomaly = eccentric_anomaly + (mean_anomaly + eccentricity * np.sin(eccentric_anomaly) - eccentric_anomaly) / (1 - eccentricity * np.cos(eccentric_anomaly))
            if np.abs(next_eccentric_anomaly - eccentric_anomaly) < tolerance:
                break
            eccentric_anomaly = next_eccentric_anomaly
        
        # Calculate true anomaly (ν) using the formula: ν = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2)).
        true_anomaly = 2 * np.arctan(np.sqrt((1 + eccentricity) / (1 - eccentricity)) * np.tan(eccentric_anomaly / 2))
        
        # Calculate distance from the center (r) using the formula: r = a * (1 - e^2) / (1 + e * cos(ν)).
        distance_from_center = semi_major_axis * (1 - eccentricity**2) / (1 + eccentricity * np.cos(true_anomaly))
        
        # Calculate predicted position (x', y', z') in the orbital plane.
        predicted_x_orbital_plane = distance_from_center * np.cos(true_anomaly)
        predicted_y_orbital_plane = distance_from_center * np.sin(true_anomaly)
        
        # Rotate predicted position by the orientation angle.
        predicted_x = predicted_x_orbital_plane * np.cos(orientation) - predicted_y_orbital_plane * np.sin(orientation)
        predicted_y = predicted_x_orbital_plane * np.sin(orientation) + predicted_y_orbital_plane * np.cos(orientation)
        
        inclination = estimate_orbital_inclination(flight_path)

        # Calculate predicted z coordinate taking into account orbital inclination.
        predicted_z = z * np.cos(inclination)
        
        # TODO: Make this the parity? Or half the parity?
        # Determine the displacement of the object over a small time interval (assuming constant speed).
        dt = PARITY
        displacement_x = speed * np.cos(orientation) * dt
        displacement_y = speed * np.sin(orientation) * dt
        
        # Update predicted position based on displacement.
        predicted_x += displacement_x
        predicted_y += displacement_y
        
        predicted_positions.append({'x': predicted_x, 'y': predicted_y, 'z': predicted_z})
    
    # Calculate error for each point.
    errors = []
    for predicted_position, data_point, confidence_score_modifier in zip(predicted_positions, flight_path, confidence_score_modifiers):
        # Extract observed coordinates (x, y, z).
        observed_x, observed_y, observed_z = data_point['x'], data_point['y'], data_point['z']
        
        # Extract predicted coordinates (x', y', z').
        predicted_x, predicted_y, predicted_z = predicted_position['x'], predicted_position['y'], predicted_position['z']
        
        # Calculate squared error (weighted by confidence score modifier).
        squared_error = (predicted_x - observed_x)**2 + (predicted_y - observed_y)**2 + (predicted_z - observed_z)**2
        
        # Calculate eccentricity deviation term.
        eccentricity_deviation = (eccentricity - expected_eccentricity)**2
        
        # Combine squared error and eccentricity deviation term (weighted by confidence score modifier and beta).
        error = confidence_score_modifier * (squared_error + beta * eccentricity_deviation)
        
        errors.append(error)
    
    # Calculate total error
    total_error = sum(errors)
    
    return total_error

        # # Extract ellipse parameters
        # semi_major_axis, eccentricity, orientation = parameters
        
        # # Calculate predicted positions based on ellipse parameters
        # predicted_positions = []  # List to store predicted positions
        
        # for data_point in flight_path:
        #     # Extract coordinates (x, y, z), speed (s), and time (t)
        #     x, y, z = data_point['x'], data_point['y'], data_point['z']
        #     speed = data_point['s']
        #     time = data_point['t']
            
        #     # Calculate mean anomaly (M) using the formula: M = (2π / T) * t, where T is the orbital period
        #     mean_anomaly = (2 * np.pi / orbital_period) * time
            
        #     # Calculate eccentric anomaly (E) using the formula: E = M + e * sin(E)
        #     eccentric_anomaly = mean_anomaly
        #     while True:
        #         next_eccentric_anomaly = mean_anomaly + eccentricity * np.sin(eccentric_anomaly)
        #         if np.abs(next_eccentric_anomaly - eccentric_anomaly) < 1e-6:
        #             break
        #         eccentric_anomaly = next_eccentric_anomaly
            
        #     # Calculate true anomaly (ν) using the formula: ν = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2))
        #     true_anomaly = 2 * np.arctan(np.sqrt((1 + eccentricity) / (1 - eccentricity)) * np.tan(eccentric_anomaly / 2))
            
        #     # Calculate distance from the center (r) using the formula: r = a * (1 - e^2) / (1 + e * cos(ν))
        #     distance_from_center = semi_major_axis * (1 - eccentricity**2) / (1 + eccentricity * np.cos(true_anomaly))
            
        #     # Calculate predicted position (x', y', z') in the orbital plane
        #     predicted_x_orbital_plane = distance_from_center * np.cos(true_anomaly)
        #     predicted_y_orbital_plane = distance_from_center * np.sin(true_anomaly)
            
        #     # Rotate predicted position by the orientation angle
        #     predicted_x = predicted_x_orbital_plane * np.cos(orientation) - predicted_y_orbital_plane * np.sin(orientation)
        #     predicted_y = predicted_x_orbital_plane * np.sin(orientation) + predicted_y_orbital_plane * np.cos(orientation)
        #     predicted_z = z  # Assuming the orbit lies in the xy-plane
            
        #     predicted_positions.append({'x': predicted_x, 'y': predicted_y, 'z': predicted_z})
        
        # Calculate error for each point
        # errors = []
        # for predicted_position, data_point, confidence_score_modifier in zip(predicted_positions, flight_path, confidence_score_modifiers):
        #     # Extract observed coordinates (x, y, z)
        #     observed_x, observed_y, observed_z = data_point['x'], data_point['y'], data_point['z']
            
        #     # Extract predicted coordinates (x', y', z')
        #     predicted_x, predicted_y, predicted_z = predicted_position['x'], predicted_position['y'], predicted_position['z']
            
        #     # Calculate squared error (weighted by confidence score modifier)
        #     squared_error = (predicted_x - observed_x)**2 + (predicted_y - observed_y)**2 + (predicted_z - observed_z)**2
            
        #     # Calculate eccentricity deviation term
        #     eccentricity_deviation = (eccentricity - expected_eccentricity)**2
            
        #     # Combine squared error and eccentricity deviation term (weighted by confidence score modifier and beta)
        #     error = confidence_score_modifier * (squared_error + beta * eccentricity_deviation)
            
        #     errors.append(error)
        
        # # Calculate total error
        # total_error = sum(errors)
        
        # return total_error
        
        #  # Extract ellipse parameters
        # semi_major_axis, semi_minor_axis, eccentricity, orientation = parameters
        
        # # Calculate predicted positions based on ellipse parameters
        # predicted_positions = []  # List to store predicted positions
        
        # for data_point, estimated_speed in zip(flight_path, estimated_speeds):
        #     # Extract coordinates (x, y, z)
        #     x, y, z = data_point['x'], data_point['y'], data_point['z']
            
        #     # Predicted displacement based on speed and orientation (assuming constant speed and circular orbit)
        #     delta_x = estimated_speed * np.cos(orientation)
        #     delta_y = estimated_speed * np.sin(orientation)
            
        #     # Calculate predicted position (assuming circular orbit for simplicity)
        #     predicted_x = x + delta_x
        #     predicted_y = y + delta_y
        #     predicted_z = z
            
        #     predicted_positions.append({'x': predicted_x, 'y': predicted_y, 'z': predicted_z})
        
        # # Calculate error for each point
        # errors = []
        # for predicted_position, data_point, confidence_score_modifier in zip(predicted_positions, flight_path, confidence_score_modifiers):
        #     # Extract observed coordinates (x, y, z)
        #     observed_x, observed_y, observed_z = data_point['x'], data_point['y'], data_point['z']
            
        #     # Extract predicted coordinates (x', y', z')
        #     predicted_x, predicted_y, predicted_z = predicted_position['x'], predicted_position['y'], predicted_position['z']
            
        #     # Calculate squared error (weighted by confidence score modifier)
        #     squared_error = (predicted_x - observed_x)**2 + (predicted_y - observed_y)**2 + (predicted_z - observed_z)**2
            
        #     # Calculate eccentricity deviation term
        #     eccentricity_deviation = (eccentricity - expected_eccentricity)**2
            
        #     # Combine squared error and eccentricity deviation term (weighted by confidence score modifier and beta)
        #     error = confidence_score_modifier * (squared_error + beta * eccentricity_deviation)
            
        #     errors.append(error)
        
        # # Calculate total error
        # total_error = sum(errors)
        
        # return total_error

def estimate_orbital_period(flight_path, proximity_threshold_mod):
    """
    Estimate orbital period given a flight path.

    Parameters:
    - flight_path (list of dict): Flight path data containing observed positions.
    - proximity_threshold_mod (float): Orbital period is estimated as the described object returns to an
      approximate initial position. It is assumed that the proximity should be within 100 km.

    Returns:
    - orbital_period (float): Estimated orbital period in seconds.
    """
    # TODO: Alternative idea: what if we just lazily fit a circle? Should that approximate ellipse behavior
    # sufficiently to gather 1 orbital period?
    # TODO: In general, this function is a very rough estimate and could use improvement.
    # Extract initial position from flight path.
    # TODO: Keep in mind that there might be better "segments" or sections of the flight path for producing
    # an orbital period. We should find the "best section" with the most descriptive points (and highest
    # confidence scores) to use in deriving orbital period... AND/OR we should repeat the process of getting
    # orbital period as we do below and average all the results (weighted by confidence per orbit).
    initial_position = np.array([flight_path[0]['x'], flight_path[0]['y'], flight_path[0]['z']])
    
    # Define a threshold for proximity.
    proximity_threshold = proximity_threshold_mod * 1.0  # Adjust as needed based on the scale of coordinates.
    
    def find_orbit_period(i, points) -> Union[tuple[int, int], None]:
        # Iterate through flight path data. Return the estimated orbital period and the index.
        started_orbit = -1
        for j, point in enumerate(points[i:]):
            # Calculate distance between current point and initial position.
            current_position = np.array([point['x'], point['y'], point['z']])
            distance = np.linalg.norm(current_position - initial_position)
            
            # Check if the current point is close to the initial position.
            if distance < proximity_threshold:
                # TODO: This is kind of ridiculous, but we expect at least a couple steps between "starting" orbit
                # and exiting orbit. It's actually an assumption we're making here, there may not be a couple steps available.
                if started_orbit <= j - 2:
                    # The object has left its initial starting point and performed, hopefully, an orbital path.
                    # Calculate orbital period as the time difference between current and initial points.
                    orbital_period = flight_path[j]['t'] - flight_path[i]['t']
                    return j, orbital_period
            else:
                started_orbit = j
        # Reached the end of the data.
        return None
    
    def remove_outliers_and_average(nums: list):
         # Convert list to numpy array.
        nums = np.array(nums)

        # Calculate average.
        avg = np.mean(nums)
        
        # Calculate absolute differences.
        abs_diff = np.abs(nums - avg)
        
        # Calculate median absolute deviation (MAD).
        mad = np.median(abs_diff)
        
        # Define threshold for outliers.
        threshold = 0.5 * mad
        
        # Identify outliers.
        outliers = np.abs(nums - avg) > threshold
        
        # Remove outliers.
        filtered_nums = nums[~outliers]
        
        # Calculate average of the filtered numbers.
        avg_filtered = np.mean(filtered_nums)
        
        return avg_filtered

    # TODO: Weight by confidence!
    # Gather all the orbital period estimates we can over the course of this flight path.
    periods = []
    while True:
        i = 0
        p = find_orbit_period(i, flight_path)
        if p is None:
            break
        periods.append(p)
    if (len(periods) == 0):
        # If no point close to the initial position is found, return None.
        return None
    # Average these estimates to get the final result.
    return remove_outliers_and_average(periods)

def estimate_orbital_inclination(flight_path):
    """
    Estimate orbital inclination given a flight path.

    Parameters:
    - flight_path (list of dict): Flight path data containing observed positions.

    Returns:
    - inclination (float): Estimated orbital inclination in radians.
    """
    # Extract observed positions
    positions = np.array([[data_point['x'], data_point['y'], data_point['z']] for data_point in flight_path])

    # Calculate covariance matrix
    covariance_matrix = np.cov(positions, rowvar=False)

    # Perform singular value decomposition (SVD) to get orientation of ellipse axes
    _, _, v = np.linalg.svd(covariance_matrix)

    # Extract direction of smallest axis (normal to orbital plane)
    normal_vector = v[2]

    # Calculate inclination angle
    inclination = np.arccos(np.dot(normal_vector, [0, 0, 1]))

    return inclination

def fit_ellipse_to_flight_path(flight_path):
    """
    Fit an ellipse to the list of points in the flight path.
    """
    # Preprocess flight path data
    normalized_flight_path, estimated_speeds, confidence_score_modifiers = preprocess_data(flight_path)
    
    # Estimate ellipse parameters
    optimized_parameters = estimate_parameters(normalized_flight_path, estimated_speeds)
    
    # Calculate error for the fitted ellipse
    total_error = calculate_error(optimized_parameters, normalized_flight_path, estimated_speeds, confidence_score_modifiers)
    
    return optimized_parameters, total_error

# TODO: Remove?
def ellipse_model(params, t):
    """
    Utility model function representing the parametric equations of an ellipse in 3D space. Uses
    the six Keplerian orbital elements.

    Parameters:
        params (list or array-like): List of six Keplerian orbital elements [a, e, incl, omega, Omega, M].
        t (array-like): Array of time values.

    Returns:
        model_points (np.ndarray): Array of shape (len(t), 3) representing the model points on the ellipse.
    """
    a, e, incl, omega, Omega, M = params
    # Compute eccentric anomaly (E) from mean anomaly (M)
    E = M + e * np.sin(M)
    # Compute Cartesian coordinates of model points on the ellipse
    x = a * (np.cos(E) - e)
    y = a * np.sqrt(1 - e**2) * np.sin(E)
    z = np.zeros_like(t)  # Assume a coplanar orbit
    # Rotate the ellipse to its proper orientation in space
    x_rot = x * (np.cos(omega) * np.cos(Omega) - np.sin(omega) * np.sin(Omega) * np.cos(incl)) \
            - y * (np.sin(omega) * np.cos(Omega) + np.cos(omega) * np.sin(Omega) * np.cos(incl))
    y_rot = x * (np.cos(omega) * np.sin(Omega) + np.sin(omega) * np.cos(Omega) * np.cos(incl)) \
            + y * (np.cos(omega) * np.cos(Omega) - np.sin(omega) * np.sin(Omega) * np.cos(incl))
    z_rot = x * np.sin(omega) * np.sin(incl) + y * np.cos(omega) * np.sin(incl)
    model_points = np.column_stack((x_rot, y_rot, z_rot))
    return model_points

# Main function
if __name__ == "__main__":
    # Sample flight path data
    flight_path = [...]  # Your flight path data
    
    # Fit ellipse to flight path
    ellipse_parameters, fitting_error = fit_ellipse_to_flight_path(flight_path)
    
    # Output results
    print("Optimized Ellipse Parameters:", ellipse_parameters)
    print("Fitting Error:", fitting_error)

