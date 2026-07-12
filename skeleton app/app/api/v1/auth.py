from datetime import timedelta
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token, PasswordResetRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user credentials profile.
    """
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and retrieve a secure access token.
    """
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.email, role=user.role, expires_delta=access_token_expires
    )
    return Token(access_token=token, token_type="bearer")

def send_reset_email(email: str):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port_str = os.getenv("SMTP_PORT", "587")
    try:
        smtp_port = int(smtp_port_str)
    except ValueError:
        smtp_port = 587
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # Only attempt sending if smtp credentials/settings are supplied
    if not smtp_username or not smtp_password:
        print(f"Skipping SMTP email dispatch: credentials not set. Password reset requested for {email}.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "EcoSphere Password Reset Request"
    msg["From"] = smtp_username
    msg["To"] = email

    text_content = (
        f"Hello,\n\nYou requested a password reset for your EcoSphere account.\n"
        f"Please contact your ESG Administrator to update your password credentials.\n\n"
        f"Best regards,\nEcoSphere Compliance Team"
    )
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 20px; border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 30px; border: 1px solid #1e293b; border-radius: 12px; color: #f1f5f9;">
          <h2 style="color: #10b981; margin-top: 0;">EcoSphere Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your EcoSphere account.</p>
          <p>Please contact your ESG Administrator to update your password credentials.</p>
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8;">Best regards,<br/>EcoSphere Compliance Team</p>
        </div>
      </body>
    </html>
    """

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            print(f"Password reset email sent successfully to {email}.")
    except Exception as e:
        print(f"Error sending password reset email to {email}: {e}")

@router.post("/reset-password")
def reset_password(request_in: PasswordResetRequest, background_tasks: BackgroundTasks):
    """
    Authenticate user and trigger real SMTP password reset.
    """
    background_tasks.add_task(send_reset_email, request_in.email)
    return {"message": f"Password reset instructions successfully sent to {request_in.email}."}
