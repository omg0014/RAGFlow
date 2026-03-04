from fastapi import HTTPException

def safe_execute(func, *args, **kwargs):
    try:
        return func(*args, **kwargs)
    except HTTPException as http_err:
        raise http_err
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
