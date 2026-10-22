# 주의: 어제(day01) 파일이 없어 오늘 실습 결과가 정답과 같게 나오도록 다시 만든 rbac.py 입니다.
import json                                                      # JSON 파일을 읽는 모듈

with open("config/users.json", encoding="utf-8") as f:           # 사용자 파일을 연다
    USERS = json.load(f)                                         # 사용자 → {역할, 재직 여부}

with open("config/roles.json", encoding="utf-8") as f:           # 역할 파일을 연다
    ROLES = json.load(f)                                         # 역할 → 권한 목록


def check_permission(user, resource, action):                    # 사용자 · 자원 · 행위를 받는 함수
    """(허용 여부, 이유)를 리턴한다."""
    if user not in USERS:                                        # 등록되지 않은 사용자
        return False, "등록되지 않은 사용자"
    if not USERS[user]["employed"]:                              # 퇴사한 계정
        return False, "퇴사한 계정"
    role = USERS[user]["role"]
    if role not in ROLES:                                        # 역할이 비었거나 없는 역할
        return False, "역할이 없음"
    if f"{resource}:{action}" in ROLES[role]:                    # 역할에 그 권한이 있으면
        return True, "허용"
    return False, "권한 없음"
