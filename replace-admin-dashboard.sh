#!/bin/bash

# AdminDashboard.tsx 백업 생성
cp /Users/scott/software-career/src/pages/AdminDashboard.tsx /Users/scott/software-career/src/pages/AdminDashboard-backup.tsx

# 향상된 버전으로 교체
cp /Users/scott/software-career/src/pages/AdminDashboard-Enhanced.tsx /Users/scott/software-career/src/pages/AdminDashboard.tsx

echo "AdminDashboard.tsx가 향상된 버전으로 교체되었습니다."
echo "백업 파일: AdminDashboard-backup.tsx"