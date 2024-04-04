import numpy as np
from sklearn.decomposition import PCA

def fit_ellipse_pca(observed_points):
    """
    Fit an ellipse to the observed points using Principal Component Analysis (PCA).

    Parameters:
        observed_points (np.ndarray): Array of shape (N, 3) representing observed points.

    Returns:
        ellipse_params (tuple): Tuple containing the parameters of the best-fit ellipse.
    """
    # Perform PCA on observed points
    pca = PCA(n_components=2)
    pca.fit(observed_points)
    
    # Extract principal components
    principal_components = pca.components_

    # Extract center of the ellipse (mean of observed points)
    center = np.mean(observed_points, axis=0)

    # Extract semi-major and semi-minor axes lengths
    semi_major_axis_length = np.linalg.norm(principal_components[0])
    semi_minor_axis_length = np.linalg.norm(principal_components[1])

    # Extract orientation angle of the ellipse
    orientation_angle = np.arctan2(principal_components[0, 1], principal_components[0, 0])

    # Return tuple containing ellipse parameters
    ellipse_params = (center[0], center[1], center[2], semi_major_axis_length, semi_minor_axis_length, orientation_angle)
    return ellipse_params

# Example usage
if __name__ == "__main__":
    # Example observed points
    observed_points = np.array([
        [0.09834656272990491, 1.3058987135924756, -0.4216147641794593],
        [-1.394440151263701, -1.0377787399951643, -3.1146443337834087],
        # Add more points here...
    ])

    # Fit ellipse to observed points using PCA
    ellipse_params = fit_ellipse_pca(observed_points)

    print("Best fit ellipse parameters (PCA-based):")
    print("Center:", ellipse_params[:3])
    print("Semi-major axis length:", ellipse_params[3])
    print("Semi-minor axis length:", ellipse_params[4])
    print("Orientation angle (phi):", ellipse_params[5])