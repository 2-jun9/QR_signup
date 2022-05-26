import './Register.css';
import shop from '../img/shop.png'
import logo from '../img/kt.png'
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';

import { child, get, set, ref } from "firebase/database";
import { database } from "../firebase";

let pin;
let today = 0;
let storeName= '';

function writeUserData(inputs, pinNumber) {
  const db = database;
  const {id, password, name} = inputs;
  const expiryDate = "20230101";
  set(ref(db, 'shop/' + id), {
    password: password,
    name : name,
    pinNumber : pinNumber,
    expiryDate : expiryDate
  });
  set(ref(db, `${pinNumber}/`), {
    name : name,
    length : {current: 0, total: 0},
    today : today,
    waitingTime : '10'
  });
} // 데이터베이스에 기록하는 함수

function Register() {
  return (
    <div className="Div">
      <div className="Logo">
        <img src={logo}></img>
      </div>
      <Left></Left>
      <Right></Right>
    </div>
  );
} // 메인으로 보여주는 함수

function Left() {
  return (
      <div className="Left">
        <div className="Box">
          <div className="LogoTitle">QR Waiting</div>
          <div className="About">
            <p className="Bigp">가게를 등록하고</p>
            <p className="Bigp">QR코드를 생성하세요</p>
            <p className="Smallp">이 서비스는 QR웨이팅을 사용하시는 점주님들께 제공하는 서비스입니다</p>
            <p className="Smallp">DIGICO KT</p>
          </div>
          <div className="Image"><img src={shop}/></div>
        </div>
      </div>
  );
} // 왼쪽에서 보여주는 UI

function Right() {

  let [result,resultC] = useState(0); 
  let [버튼, 버튼변경] = useState(false); // 버튼 상태를 관리하기 위한 state
  let [아이디확인, 아이디확인변경] = useState(false); // 아이디 존재여부 검사 후 경고문구 표시를 위한 state

  const [inputs, setInputs] = useState({
    id: '',
    password: '',
    name: '',
  }); // 멀티 인풋 값을 관리하는 state
  const dbRef = ref(database);

  useEffect(()=>{
    function RandomPin(){
      const getRandom = (min, max) => Math.floor(Math.random() * (max - min) + min);
      let result2 = getRandom(1000, 9999);
      return result2;
    } // PIN 랜덤 생성함수
    
    function ReadData() {
      let result3 = RandomPin();
      
      get(child(dbRef, `${result3}`)).then((snapshot)=>{
        if (snapshot.exists()) {
          console.log(snapshot.val());
          ReadData();
        } else {
          resultC(result3);
          pin = result3;
        }
      }).catch((error) => {
        console.error(error);
      });
    } // 데이터베이스에서 PIN 번호 중복 확인

    ReadData();
  },[]); // 비동기로 처음 컴포넌트 렌더링 시에만 실행되는 hook


  const { id, password, name } = inputs;

  const onChange = (e) => {
    const { value, name } = e.target; // 우선 e.target 에서 name 과 value 를 추출
    setInputs({
      ...inputs, // 기존의 input 객체를 복사한 뒤, 하드카피
      [name]: value // name 키를 가진 값을 value 로 설정
    });

    get(child(dbRef, 'shop/' + `${value}`)).then((snapshot)=>{
      if (snapshot.exists()) {
        아이디확인변경(true);
      } else {
        아이디확인변경(false);
      }
    }).catch((error) => {
      console.error(error);
    }); // ID 중복검사

    if(inputs.id.length > 1 && inputs.password.length > 1 && inputs.name.length > 1){
      버튼변경(true);
    }
  }; // 각 input에서 타이핑이 진행되는 걸 기록하는 함수

  const onClick = () => {
    storeName = inputs.name;
    writeUserData(inputs ,result);
  } // 버튼 클릭시 실행되는 함수

  function Button() {
    if(버튼===false){
      return(<button>QR코드 생성하기</button>);
    }
    else {
      return(<Link to='qr'><button onClick={onClick}>QR코드 생성하기</button></Link>);
    }
  }

  function CheckId() {
    const style = {
      color: "red"
    }

    if(아이디확인 === true){
      return (
        <div>
          <div style={style}>이미 존재하는 아이디 입니다.</div>
        </div>
      );
    }else {
      return (
        <div></div>
      );
    }
  }

  return (
      <div className="Right">
        <div className="Card">
          <div></div>
          <div>
            <p>ID</p>
            <input type="text" name="id" onChange={onChange} value={id}></input>
          </div>
          <div>
            <p>PASSWORRD</p>
            <input type="password" name="password" onChange={onChange} value={password}></input>
          </div>
          <div>
            <p>가게명</p>
            <input type="text" name="name" onChange={onChange} value={name}></input>
          </div>
          <CheckId></CheckId>
          <div>
            <Button></Button>
          </div>
          <div></div>
          <div></div>
        </div>
      </div>
  );
} // 오른쪽에 보여주는 UI, 실질적인 입력을 받는 부분

export default Register;
export { pin };
export { storeName };