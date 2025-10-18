import os
import io
import base64
import requests
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self):
        self.api_key = os.getenv('ALIBABA_CLOUD_API_KEY')
        self.api_secret = os.getenv('ALIBABA_CLOUD_API_SECRET')
        self.nls_base_url = "https://nls-gateway.cn-shanghai.aliyuncs.com"
        
    def speech_to_text(self, audio_file) -> str:
        """语音转文字"""
        try:
            # 读取音频文件
            audio_data = audio_file.read()
            
            # 调用阿里云语音识别API
            text = self._call_speech_recognition_api(audio_data)
            
            return text
            
        except Exception as e:
            logger.error(f"语音识别错误: {str(e)}")
            return "语音识别失败，请重试"
    
    def text_to_speech(self, text: str) -> str:
        """文字转语音"""
        try:
            # 调用阿里云语音合成API
            audio_url = self._call_speech_synthesis_api(text)
            
            return audio_url
            
        except Exception as e:
            logger.error(f"语音合成错误: {str(e)}")
            return ""
    
    def _call_speech_recognition_api(self, audio_data: bytes) -> str:
        """调用语音识别API"""
        try:
            # 将音频数据转换为base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'audio': audio_base64,
                'format': 'wav',
                'sample_rate': 16000
            }
            
            response = requests.post(
                f"{self.nls_base_url}/stream/v1/asr",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('result', '')
            else:
                logger.error(f"语音识别API调用失败: {response.status_code}")
                return ""
                
        except Exception as e:
            logger.error(f"调用语音识别API错误: {str(e)}")
            return ""
    
    def _call_speech_synthesis_api(self, text: str) -> str:
        """调用语音合成API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'text': text,
                'voice': 'xiaoyun',
                'format': 'wav',
                'sample_rate': 16000
            }
            
            response = requests.post(
                f"{self.nls_base_url}/stream/v1/tts",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                # 保存音频文件并返回URL
                audio_filename = f"tts_{hash(text)}.wav"
                audio_path = os.path.join('static', 'audio', audio_filename)
                
                # 确保目录存在
                os.makedirs(os.path.dirname(audio_path), exist_ok=True)
                
                with open(audio_path, 'wb') as f:
                    f.write(response.content)
                
                return f"/static/audio/{audio_filename}"
            else:
                logger.error(f"语音合成API调用失败: {response.status_code}")
                return ""
                
        except Exception as e:
            logger.error(f"调用语音合成API错误: {str(e)}")
            return ""
