import numpy as np
from scipy.optimize import least_squares

# Define the objective function
def objective_function(params, points):
    """
    Objective function to minimize the difference between observed points and model points.

    Parameters:
        params (list or array-like): List of six Keplerian orbital elements [a, e, incl, omega, Omega, M].
        points (np.ndarray): Array of shape (N, 3) representing observed points.

    Returns:
        residuals (np.ndarray): Array of residuals between observed and model points.
    """
    # Extract Keplerian orbital elements
    a, e, incl, omega, Omega, M = params
    
    # Compute eccentric anomaly (E) from mean anomaly (M)
    E = M + e * np.sin(M)
    
    # Compute Cartesian coordinates of model points on the ellipse
    x = a * (np.cos(E) - e)
    y = a * np.sqrt(1 - e**2) * np.sin(E)
    z = np.zeros_like(x)  # Assume a coplanar orbit
    
    # Rotate the ellipse to its proper orientation in space
    x_rot = x * (np.cos(omega) * np.cos(Omega) - np.sin(omega) * np.sin(Omega) * np.cos(incl)) \
            - y * (np.sin(omega) * np.cos(Omega) + np.cos(omega) * np.sin(Omega) * np.cos(incl))
    y_rot = x * (np.cos(omega) * np.sin(Omega) + np.sin(omega) * np.cos(Omega) * np.cos(incl)) \
            + y * (np.cos(omega) * np.cos(Omega) - np.sin(omega) * np.sin(Omega) * np.cos(incl))
    z_rot = x * np.sin(omega) * np.sin(incl) + y * np.cos(omega) * np.sin(incl)
    
    # Compute residuals
    model_points = np.column_stack((x_rot, y_rot, z_rot))
    residuals = points - model_points
    return residuals.flatten()

# Function to estimate Keplerian orbital elements from observed points
def estimate_orbital_elements(observed_points, initial_guess):
    """
    Estimate Keplerian orbital elements from observed points using least squares fitting.

    Parameters:
        observed_points (np.ndarray): Array of shape (N, 3) representing observed points.
        initial_guess (list or array-like): Initial guess for the six Keplerian orbital elements [a, e, incl, omega, Omega, M].

    Returns:
        best_fit_params (np.ndarray): Array of best fit Keplerian orbital elements.
    """
    result = least_squares(objective_function, initial_guess, args=(observed_points,))
    best_fit_params = result.x
    return best_fit_params

# Example usage
if __name__ == "__main__":
    # Example observed points (replace with your data)
    observed_points = np.array([
        [1.4853035140715223, -3.177383226625056, 2.722464169237539],
        [-0.011740320639113006, -3.692222332314877, 2.759426093561851],
        # Add more points here...
    ])
    
    # Initial guess for Keplerian orbital elements (replace with your initial guess)
    initial_guess = [1.0, 0.5, np.pi/4, np.pi/4, np.pi/4, np.pi/4]
    
    # Estimate Keplerian orbital elements from observed points
    best_fit_params = estimate_orbital_elements(observed_points, initial_guess)
    
    print("Best fit Keplerian orbital elements:")
    print("Semi-major axis (a):", best_fit_params[0])
    print("Eccentricity (e):", best_fit_params[1])
    print("Inclination (incl):", best_fit_params[2])
    print("Argument of periapsis (omega):", best_fit_params[3])
    print("Longitude of ascending node (Omega):", best_fit_params[4])
    print("Mean anomaly (M):", best_fit_params[5])