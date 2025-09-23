#!/bin/bash

# 修复最近的 commit 消息格式，将中文前缀改为英文格式
# 这样 semantic-release 就能正确识别并创建 release

echo "正在修复 commit 消息格式..."

# 修复 chore(release): 前缀
git filter-branch -f --msg-filter '
    sed "s/^chore(release):/chore(release):/g" | 
    sed "s/^build(deps):/build:/g" |
    sed "s/^ci(github):/ci:/g"
' -- HEAD~3..HEAD

echo "Commit 消息修复完成！"
echo "现在可以推送更改并触发新的 release："
echo "git push --force"