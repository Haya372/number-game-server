# number-game-server
数字ゲームアプリのバックエンドリポジトリ  
express + socketioによる実装
## イベント
### client -> server
| イベント名 | パラメータ | 詳細 |
| --- | --- | --- |
| create | room_id, username | 部屋を作成するイベント。部屋を作成したユーザーはその部屋に入室する。 room_idは任意の文字列、usernameは表示するユーザー名 |
| get rooms | | 参加可能な部屋一覧を取得するイベント |
| join | room_id, username | 部屋に入室するイベント |
| leave | room_id, user_id | 待機画面において部屋を退出する時のイベント |
| re-entry | room_id | なんらかの問題で接続が切れた場合の再入室処理 |
| start | room_id, turns | ゲームを開始するイベント。 turnsでターン数を指定する |
| choose | room_id, user_id, turn_num, number | user_idはユーザーの表示名ではない。turn_numは現在のターン番号, numberは選んだ数字 |
| exit room | room_id | サーバー側でルームを退出する処理(ゲーム終了時) |
| finish | | ゲームを終了する |
### server -> client
| イベント名 | パラメータ | 詳細 |
| --- | --- | --- |
| enter | { members : ['user1', 'user2', ... ] } | 誰かが部屋に入った時、その部屋のメンバー全員に今いるメンバーを通知 |
| leave | user_id | 誰かが部屋を抜けた時にその部屋のメンバーに抜けた人のインデックスを通知 |
| user_id | { user_id: [ユーザーID] } | ユーザーID（メンバー一覧や選択一覧におけるインデックス)を通知 |
| room list | {rooms: [{ room_id: 'room1', host: 'host user', people: number_of_people }, ... ] } | 参加可能な部屋の一覧を返す |
| start | { members : ['user1', 'user2', ... ], turns: turns } | ゲームの始まりとターン数を通知 |
| everyone selected | { turn_num : [現在のターン数], numbers: [2, 4, 1, ... ] } | 全員が選択し終わったことを通知。 |
| finish | | ゲーム終了を通知 |
| err | { msg: 'エラーメッセージ' } | エラーを通知 |

server -> clientは基本的にJSONでデータを渡す