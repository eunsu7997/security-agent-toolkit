# 짤·카드 스튜디오
브라우저에서 PNG/JPEG + 문구를 편집하는 정적 웹앱. dist/index.html이 진입점입니다.

- 1:1 / 4:5 / 9:16, 동일 Canvas 미리보기·PNG 출력
- 고정 ID를 사용한 localStorage 템플릿 CRUD(현재 브라우저 범위)
- 스키마/범위/이미지 디코딩 검증을 마친 뒤 JSON을 원자적으로 가져오기
- 사용자가 올린 이미지는 Canvas 재인코딩으로 EXIF 등 원본 메타데이터 제외
- 최대 10MB 입력, 1600px 정규화, 40MP 디코딩 제한, 50개 템플릿 제한
- 저장 공간 부족 시 기존 메모리·저장 데이터 유지

사용법/제출 확인/검사 한계: dist/guide.html
실행 기록: dist/evidence/*.json
검사: tests/check.cjs, tests/actions.cjs (Node VM 모의 UI), tests/samples.cjs.
현재 테스트의 @napi-rs/canvas 경로는 작성 환경의 절대 경로입니다. 다른 환경에서 실행하려면 @napi-rs/canvas를 설치하고 require 경로를 패키지 이름으로 바꾸세요.
실제 브라우저 QA는 미실시. 한글 글꼴 모양은 사용자 OS 글꼴에 의존합니다.

이 프로젝트의 코드 및 타이포그래피 샘플은 AI가 작성했습니다. 사용자는 사용·수정·배포·제출할 수 있습니다. 외부 사진을 포함하지 않으며 업로드 이미지 권한은 사용자가 확인해야 합니다.
