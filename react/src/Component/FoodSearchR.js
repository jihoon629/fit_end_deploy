import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import config from "../config";
import styles from "../Style/FoodList.module.css";

const formatDate = (date) => {
  const validDate = date instanceof Date ? date : new Date(date);
  return new Date(validDate.getTime() - validDate.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

export default function FoodSearchR() {
  const location = useLocation();
  const { selectedDate, mealType } = location.state || {};
  const formattedSelectedDate = selectedDate || formatDate(new Date());
  const formattedMealType = mealType || "dinner";

  const [data, setData] = useState(null);
  const [foodNm, setFoodNm] = useState("");

  // const [dietMemo, setDietMemo] = useState(""); // 메모 입력
  const [userid, setUserid] = useState("");
  const navigate = useNavigate();

  const navigateMain = () => {
    navigate("/main");
  };
  const navigateToRecordBody = () => {
    navigate("/recordbody");
  };
  const navigateFood = () => {
    navigate("/Calender");
  };
  const navigateGraph = () => {
    navigate("/Graph");
  };
  const navigateMyPage = () => navigate("/MyPage");

  // 로그아웃 처리
  const handleLogout = async () => {
    await fetch(`http://${config.SERVER_URL}/login/logout`, {
      method: "POST",
      credentials: "include",
    });

    sessionStorage.removeItem("useridRef");
    navigate("/login");
  };

  // 쿠키에 JWT 존재 여부만 확인함
  const getCookie = (name) => {
    const cookieArr = document.cookie.split("; ");
    for (let i = 0; i < cookieArr.length; i++) {
      const cookiePair = cookieArr[i].split("=");
      if (cookiePair[0] === name) {
        return cookiePair[1];
      }
    }
    return null;
  };

  useEffect(() => {
    // 서버에서 현재 로그인한 사용자 확인
    fetch(`http://${config.SERVER_URL}/login/validate`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((data) => {
        console.log("로그인 상태 확인 성공:", data);
        setUserid(data.userid);
      })
      .catch(() => {
        console.warn("인증 실패. 로그인 페이지로 이동");
        navigate("/login");
      });
  }, [navigate]);

  // 음식 검색 API 호출
  const fetchData = () => {
    if (foodNm) {
      fetch(`http://${config.SERVER_URL}/food/foodname/${foodNm}`, {
        method: "GET",
        credentials: "include", // 쿠키 포함 요청
      })
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
    console.log(data);
  };

  // 음식 선택 후 저장 API 호출
  const handleButtonClick = (item) => {
    // if (!selectedDate) {
    //   alert("날짜를 선택하세요!");
    //   return;
    // }

    const foodData = {
      ...item,
      userid,
      timestamp: selectedDate || new Date().toISOString(),
      dietMemo: mealType || "기록 없음",
    };

    console.log("전송할 데이터:", foodData); // 전송 전에 확인

    fetch(`http://${config.SERVER_URL}/food/saveFoodRecord`, {
      method: "POST",
      credentials: "include", // 쿠키 포함 요청
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(foodData),
    })
      .then((response) => response.text()) // JSON 형식이 아니라면 .json() 대신 .text() 사용
      .then((data) => {
        console.log("서버 응답:", data);
        alert(data); // 성공 메시지 출력
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className={styles.Main_Container}>
      <img
        src="/image/black.png"
        alt="Background"
        className={styles.MainImage}
      />
      <a className={styles.maintitle}>FitEnd</a>
      <div className={styles.food_container}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={foodNm}
            onChange={(e) => setFoodNm(e.target.value)}
            placeholder="Enter food name"
            className={styles.fullWidthInput}
          />
          <button onClick={fetchData} className={styles.searchButton}>
            <img
              src="/image/foodlist/secach_button.png"
              alt="Search"
              className={styles.searchButtonImage}
            />
          </button>
        </div>

        {data ? (
          <div className={styles.food_list}>
            {data.map((item, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(item)}
                className={styles.foodItem}
              >
                {item.foodNm} {item.mfrNm}
              </button>
            ))}
          </div>
        ) : (
          <p>Search Example: 옥수수</p>
        )}

        <div className={styles.button_container}>
          {[
            {
              img: "HOME.png",
              alt: "Main",
              action: navigateMain,
              label: "Main",
            },
            {
              img: "PAPAR.png",
              alt: "Paper",
              action: navigateToRecordBody,
              label: "Paper",
            },
            {
              img: "Vector7.png",
              alt: "Graph",
              action: navigateGraph,
              label: "Graph",
            },
            {
              img: "Vector8.png",
              alt: "Food",
              action: navigateFood,
              label: "Food",
            },
            {
              img: "PEOPLE.png",
              alt: "Logout",
              action: navigateMyPage,
              label: "mypage",
            },
          ].map(({ img, alt, action, label }, idx) => (
            <div key={idx} className={styles.button_item}>
              <img
                src={`/image/${img}`}
                alt={alt}
                className={styles.buttonimage}
                onClick={action}
              />
              <span className={styles.span}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
