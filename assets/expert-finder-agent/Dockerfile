FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV HOST=0.0.0.0
ENV PORT=5000
ENV SF_SENIORITY_MIN_GRADE=""
ENV SF_SENIORITY_MAX_GRADE=""
ENV COI_EXCLUDED_ORG_UNITS=""
ENV COI_EXCLUDED_JOB_ROLES=""
ENV AICORE_LLM_MODEL="sap/anthropic--claude-4.5-sonnet"
ENV MSGRAPH_CLIENT_ID=""
ENV MSGRAPH_CLIENT_SECRET=""
ENV MSGRAPH_TENANT_ID=""

EXPOSE 5000

CMD ["python", "app/main.py"]
