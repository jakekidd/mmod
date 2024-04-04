import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np

# Example flight data
flight_data = [
    {"x": 0.09834656272990491, "y": 1.3058987135924756, "z": -0.4216147641794593, "C": 0.1294812, "t": 1000},
    {"x": -1.394440151263701, "y": -1.0377787399951643, "z": -3.1146443337834087, "C": 0.71409183571, "t": 2000},
    # More points...
]

def plot_flight_path(ellipse_params):
    """
    Plot flight path as a yellow ellipse given ellipse parameters.
    
    Parameters:
        ellipse_params (dict): Dictionary containing ellipse parameters:
            - 'a': Semi-major axis
            - 'b': Semi-minor axis
            - 'center': Tuple containing (x, y) coordinates of the center
            - 'angle': Angle of rotation (in degrees)
    """
    a = ellipse_params['a']
    b = ellipse_params['b']
    center = ellipse_params['center']
    angle = np.radians(ellipse_params['angle'])

    # Generate points on the ellipse
    t = np.linspace(0, 2 * np.pi, 100)
    x = center[0] + a * np.cos(t) * np.cos(angle) - b * np.sin(t) * np.sin(angle)
    y = center[1] + a * np.cos(t) * np.sin(angle) + b * np.sin(t) * np.cos(angle)

    # Plot the ellipse
    plt.plot(x, y, color='yellow')

    # Set labels and title
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.title('Flight Path (Yellow Ellipse)')
    plt.grid(True)

    # Show plot
    plt.axis('equal')
    plt.show()


# Convert flight data units to matplotlib units (if needed)

# Extract x, y, z coordinates from flight data
x_coords = [point['x'] for point in flight_data]
y_coords = [point['y'] for point in flight_data]
z_coords = [point['z'] for point in flight_data]

# Convert coordinates to numpy arrays for easier manipulation (if needed)
x_coords = np.array(x_coords)
y_coords = np.array(y_coords)
z_coords = np.array(z_coords)

# Create a 3D plot
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Plot Earth as a transparent wireframe (spherical)
u = np.linspace(0, 2 * np.pi, 100)
v = np.linspace(0, np.pi, 100)
earth_x = np.outer(np.cos(u), np.sin(v))
earth_y = np.outer(np.sin(u), np.sin(v))
earth_z = np.outer(np.ones(np.size(u)), np.cos(v))
ax.plot_surface(earth_x, earth_y, earth_z, color='b', alpha=0.2)

# Plot flight path as a yellow ellipse
# You would need to compute the ellipse points based on your estimated parameters

# Plot points along the flight path as red dots
ax.scatter(x_coords, y_coords, z_coords, color='r', marker='o')

# Set labels and title
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('Estimated Flight Path')

# Show plot
plt.show()
