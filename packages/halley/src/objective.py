import numpy as np
from scipy.optimize import minimize

def objective_function(params, observed_points, timestamps, confidence_scores):
    """
    Objective function to minimize the discrepancy between observed points and points on the ellipse.

    Parameters:
        params (tuple): Tuple containing the parameters of the ellipse (center, semi-axes lengths, orientation).
        observed_points (np.ndarray): Array of shape (N, 3) representing observed points.
        timestamps (np.ndarray): Array of shape (N,) representing timestamps of observed points.
        confidence_scores (np.ndarray): Array of shape (N,) representing confidence scores of observed points.

    Returns:
        total_error (float): Total weighted error between observed points and ellipse points.
    """
    # Extract ellipse parameters
    center_x, center_y, center_z, a, b, c, phi = params

    # Initialize total error
    total_error = 0.0

    # Iterate over observed points
    for i in range(len(observed_points)):
        # Calculate ellipse point
        theta = np.arctan2(observed_points[i, 1] - center_y, observed_points[i, 0] - center_x)
        ellipse_x = center_x + a * np.cos(theta) * np.cos(phi) - b * np.sin(theta) * np.sin(phi)
        ellipse_y = center_y + a * np.cos(theta) * np.sin(phi) + b * np.sin(theta) * np.cos(phi)
        ellipse_z = center_z + c * np.sin(theta)

        # Calculate weighted error
        error = np.sqrt((observed_points[i, 0] - ellipse_x)**2 + (observed_points[i, 1] - ellipse_y)**2 + (observed_points[i, 2] - ellipse_z)**2)
        weighted_error = confidence_scores[i] * error

        # Add weighted error to total error
        total_error += weighted_error

    return total_error

def fit_ellipse(observed_points, timestamps, confidence_scores):
    """
    Fit an ellipse to the observed points using optimization.

    Parameters:
        observed_points (np.ndarray): Array of shape (N, 3) representing observed points.
        timestamps (np.ndarray): Array of shape (N,) representing timestamps of observed points.
        confidence_scores (np.ndarray): Array of shape (N,) representing confidence scores of observed points.

    Returns:
        ellipse_params (tuple): Tuple containing the parameters of the best-fit ellipse.
    """
    # Initial guess for ellipse parameters
    center_guess = np.mean(observed_points, axis=0)
    a_guess = np.max(np.abs(observed_points - center_guess), axis=0)
    b_guess = np.min(np.abs(observed_points - center_guess), axis=0)
    c_guess = np.max(np.abs(observed_points[:, 2] - center_guess[2]))
    phi_guess = 0.0
    initial_guess = (center_guess[0], center_guess[1], center_guess[2], a_guess[0], b_guess[1], c_guess, phi_guess)

    # Minimize the objective function
    result = minimize(objective_function, initial_guess, args=(observed_points, timestamps, confidence_scores))

    # Extract ellipse parameters from optimization result
    center_x, center_y, center_z, a, b, c, phi = result.x

    # Return tuple containing ellipse parameters
    ellipse_params = (center_x, center_y, center_z, a, b, c, phi)
    return ellipse_params

# Example usage
if __name__ == "__main__":
    # Example observed points, timestamps, and confidence scores
    observed_points = np.array([
        [0.09834656272990491, 1.3058987135924756, -0.4216147641794593],
        [-1.394440151263701, -1.0377787399951643, -3.1146443337834087],
        # Add more points here...
    ])
    timestamps = np.array([1000, 2000, ...])  # Add timestamps for each observed point
    confidence_scores = np.array([0.1294812, 0.71409183571, ...])  # Add confidence scores for each observed point

    # Fit ellipse to observed points
    ellipse_params = fit_ellipse(observed_points, timestamps, confidence_scores)

    print("Best fit ellipse parameters:")
    print("Center:", ellipse_params[:3])
    print("Semi-axes lengths:", ellipse_params[3:6])
    print("Orientation angle (phi):", ellipse_params[6])
