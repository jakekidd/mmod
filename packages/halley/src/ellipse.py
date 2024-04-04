import numpy as np
from scipy.optimize import least_squares

def ellipse_model(params, t):
    """
    Model function representing the parametric equations of an ellipse in 3D space.

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

def objective_function(params, t, observed_points):
    """
    Objective function to minimize the difference between observed points and model points.

    Parameters:
        params (list or array-like): List of six Keplerian orbital elements [a, e, incl, omega, Omega, M].
        t (array-like): Array of time values.
        observed_points (np.ndarray): Array of shape (len(t), 3) representing observed points.

    Returns:
        residuals (np.ndarray): Array of residuals between observed and model points.
    """
    model_points = ellipse_model(params, t)
    residuals = observed_points - model_points
    return residuals.flatten()

def fit_keplerian_orbit(t, observed_points, initial_guess):
    """
    Fit Keplerian orbital elements to observed points using nonlinear least squares.

    Parameters:
        t (array-like): Array of time values.
        observed_points (np.ndarray): Array of shape (len(t), 3) representing observed points.
        initial_guess (list or array-like): Initial guess for the six Keplerian orbital elements [a, e, incl, omega, Omega, M].

    Returns:
        best_fit_params (np.ndarray): Array of best fit Keplerian orbital elements.
    """
    result = least_squares(objective_function, initial_guess, args=(t, observed_points))
    best_fit_params = result.x
    return best_fit_params

# Example usage
if __name__ == "__main__":
    # Example observed points and time values (replace with your data)
    t = np.linspace(0, 10, 100)
    observed_points = np.random.rand(100, 3)  # Example observed points
    initial_guess = [1.0, 0.5, np.pi/4, np.pi/4, np.pi/4, np.pi/4]  # Initial guess for Keplerian orbital elements

    # Fit Keplerian orbital elements to observed points
    best_fit_params = fit_keplerian_orbit(t, observed_points, initial_guess)

    print("Best fit Keplerian orbital elements:")
    print("Semi-major axis (a):", best_fit_params[0])
    print("Eccentricity (e):", best_fit_params[1])
    print("Inclination (incl):", best_fit_params[2])
    print("Argument of periapsis (omega):", best_fit_params[3])
    print("Longitude of ascending node (Omega):", best_fit_params[4])
    print("Mean anomaly (M):", best_fit_params[5])
