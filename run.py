from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Use Railway's PORT environment variable
    port = int(os.getenv('PORT', 8080))
    app.run(
        debug=False,
        host='0.0.0.0',
        port=port
    )
