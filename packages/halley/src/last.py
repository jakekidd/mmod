import numpy as np
from scipy.optimize import minimize

def compute_position(t, a, i, Omega, f):
    """
    Compute the position of the object at time t using Keplerian orbital elements.
    """
    # Convert angles to radians
    i = np.radians(i)
    Omega = np.radians(Omega)
    f = np.radians(f)
    
    # Compute position
    x = a * (np.cos(f) * np.cos(Omega) - np.sin(f) * np.cos(i) * np.sin(Omega))
    y = a * (np.cos(f) * np.sin(Omega) + np.sin(f) * np.cos(i) * np.cos(Omega))
    z = a * (np.sin(f) * np.sin(i))
    
    return np.array([x, y, z])

def loss_function(params, t_data, xyz_data, confidence_scores):
    """
    Loss function to minimize for nonlinear regression.
    """
    a, i, Omega, f = params
    total_loss = 0
    for t, xyz, confidence in zip(t_data, xyz_data, confidence_scores):
        predicted_xyz = compute_position(t, a, i, Omega, f)
        squared_error = np.sum((xyz - predicted_xyz) ** 2)
        total_loss += confidence * squared_error
    return total_loss

def fit_elliptical_orbit(flight_data):
    """
    Fit an elliptical orbit to the provided flight data using nonlinear regression.
    """
    # Extract data from flight data
    t_data = np.array([point['t'] for point in flight_data])
    xyz_data = np.array([[point['x'], point['y'], point['z']] for point in flight_data])
    confidence_scores = np.array([point['C'] for point in flight_data])
    
    # Initial guesses for parameters
    initial_guesses = [10, 45, 0, 0]  # Adjust initial guesses as needed
    
    # Perform nonlinear regression
    result = minimize(loss_function, initial_guesses, args=(t_data, xyz_data, confidence_scores))
    
    # Extract fitted parameters
    a_fit, i_fit, Omega_fit, f_fit = result.x
    
    # Additional optimization can be implemented here
    
    return a_fit, i_fit, Omega_fit, f_fit

def main(flight_data):
    # Fit elliptical orbit
    a_fit, i_fit, Omega_fit, f_fit = fit_elliptical_orbit(flight_data)
    
    # Print fitted parameters
    print("Best-fit Keplerian orbital elements:")
    print("Semi-major axis (a):", a_fit)
    print("Inclination (i):", i_fit)
    print("Longitude of the ascending node (Omega):", Omega_fit)
    print("True anomaly (f):", f_fit)
    
    # Additional analysis or visualization can be performed here

# Example flight data
flight_data = [
    {"x": 0.09834656272990491, "y": 1.3058987135924756, "z": -0.4216147641794593, "C": 0.1294812, "t": 1000},
    {"x": -1.394440151263701, "y": -1.0377787399951643, "z": -3.1146443337834087, "C": 0.71409183571, "t": 2000},
    # More points...
]

# Run the main function
main(flight_data)
