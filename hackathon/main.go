package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/oklog/ulid/v2"
	_ "github.com/oklog/ulid/v2"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

type UserResForHTTPGet struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Age  int    `json:"age"`
}

type User struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

type UserResForHTTPPost struct {
	Id string `json:"id"`
}

// ① GoプログラムからMySQLへ接続
var db *sql.DB

func init() {

	// DB接続のための準備
	mysqlUser := os.Getenv("MYSQL_USER")
	mysqlPwd := os.Getenv("MYSQL_PWD")
	//mysqlHost := os.Getenv("MYSQL_HOST")
	mysqlDatabase := os.Getenv("MYSQL_DATABASE")

	// ①-2
	_db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@(localhost:3306)/%s", mysqlUser, mysqlPwd, mysqlDatabase))
	if err != nil {
		log.Fatalf("fail: sql.Open, %v\n", err)
	}
	// ①-3
	if err := _db.Ping(); err != nil {
		log.Fatalf("fail: _db.Ping, %v\n", err)
	}
	db = _db
}

// ② /userでリクエストされたらnameパラメーターと一致する名前を持つレコードをJSON形式で返す
func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set(`Access-Control-Allow-Origin`, "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set(`Access-Control-Allow-Methods`, "GET,PUT,POST,DELETE,UPDATE,OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {

	case http.MethodGet:
		// ②-1
		name := r.URL.Query().Get("name")
		/*if name == "" {
			log.Println("fail: name is empty")
			w.WriteHeader(http.StatusBadRequest)
			return
		}*/
		if len(name) > 50 {
			log.Println("fail: name is too long")
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			log.Printf("fail: db.Begin, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		defer tx.Rollback() //???
		// ②-2
		rows, err := db.Query("SELECT id, name, age FROM user") //成功するとrowsに情報、errにnil 失敗するとrowsにnli errにエラー目セージQueryはデータベースへの操作

		if err != nil {
			log.Printf("fail: db.Query, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// ②-3
		users := make([]UserResForHTTPGet, 0)
		for rows.Next() {
			var u UserResForHTTPGet
			if err := rows.Scan(&u.Id, &u.Name, &u.Age); err != nil {
				log.Printf("fail: rows.Scan, %v\n", err)

				if err := rows.Close(); err != nil { // 500を返して終了するが、その前にrowsのClose処理が必要
					log.Printf("fail: rows.Close(), %v\n", err)
				}
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			users = append(users, u)
		}

		// ②-4
		bytes, err := json.Marshal(users)
		if err != nil {
			log.Printf("fail: json.Marshal, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(bytes)

	case http.MethodPost:
		// POSTメソッドのボディをJSONとして解析
		//なんでわざわざjsonに直したり治さなかったりする？？

		id := ulid.Make().String()
		var user User
		var u UserResForHTTPPost
		u.Id = id
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&user); err != nil {
			log.Printf("fail: json decode, %v\n", err)
			http.Error(w, "Bad Request: Invalid JSON", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		if user.Age < 20 || user.Age > 80 {
			log.Println("fail: age is out of range")
			http.Error(w, "Bad Request: Invalid Age", http.StatusBadRequest)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			log.Printf("fail: db.Begin, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// データベースにユーザーを保存
		_, execerr := db.Exec("INSERT INTO user (id,name,age) VALUES (?,?,?)", id, user.Name, user.Age)
		if execerr != nil {
			log.Printf("fail: db.Exec, %v\n", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError) //wはクライアントに書き込むため、エラーメッセージ、なんのエラーかの表記
			return
		}
		bytes, err := json.Marshal(u)
		if err != nil {
			log.Printf("fail: json.Marshal, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		tx.Commit()

		w.Header().Set("Content-Type", "application/json")

		w.Write(bytes)

		// 成功した場合にはHTTPステータス201 (Created) を返す
		w.WriteHeader(http.StatusCreated)

	default:
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
}

func main() {
	// ② /userでリクエストされたらnameパラメーターと一致する名前を持つレコードをJSON形式で返す
	http.HandleFunc("/user", handler)

	// ③ Ctrl+CでHTTPサーバー停止時にDBをクローズする
	closeDBWithSysCall()

	// 8000番ポートでリクエストを待ち受ける
	log.Println("Listening...")
	if err := http.ListenAndServe(":8000", nil); err != nil {
		log.Fatal(err)

	}
}

// ③ Ctrl+CでHTTPサーバー停止時にDBをクローズする
func closeDBWithSysCall() {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		s := <-sig
		log.Printf("received syscall, %v", s)

		if err := db.Close(); err != nil {
			log.Fatal(err)
		}
		log.Printf("success: db.Close()")
		os.Exit(0)
	}()
}
