import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, ScrollView, StyleSheet, TouchableOpacity, Linking, TextInput, BackHandler, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Axios 라이브러리 import

const saveButtonState = async (isEnabled) => {
  try {
    await AsyncStorage.setItem('buttonEnabled', isEnabled.toString());
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

const getButtonState = async () => {
  try {
    const buttonEnabled = await AsyncStorage.getItem('buttonEnabled');
    return buttonEnabled === 'true';
  } catch (error) {
    console.error('오류 발생:', error);
    return false;
  }
};



const MainScreen = ({ onLogin, onSignUp }) => { //로그인 화면
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false); 

  const handleLogin = () => { //로그인 테스트용
    if (username === 'user' && password === 'password') {
      onLogin();
    } else {
      alert('로그인 실패');
    }
  };

  // 아래가 만든 로그인 로직인데... 제대로 안돌아간다




  // const handleLogin = async () => {
  //   try {
  //     const response = await axios.post('http://localhost:8080/api/user', { username: username, password:password });
      
  //     // 서버에서 로그인이 성공적으로 처리되면 로그인 상태 변경
  //     if (response.data.success) {
  //       onLogin();
  //     } else {
  //       alert('로그인 실패');
  //     }
  //   } catch (error) {
  //     console.error('로그인 실패:', error);
  //   }
  // };



  const handleSignUp = async () => {// 회원가입로직인데,,,마찬가지이다.
    try {
      const response = await axios.post('http://localhost:8080/api/user/', { username, password });
      
      // 서버에서 회원가입이 성공적으로 처리되면 로그인 상태 변경
      if (response.data.success) {
        onSignUp();
      } else {
        alert('회원가입 실패');
      }
    } catch (error) {
      console.error('회원가입 실패:', error);
    }
  };
  
  const toggleSignUpMode = () => {
    setIsSignUpMode(prevMode => !prevMode);
  };



  return (
    <View style={styles.loginContainer}>
      <Image source={require('./assets/cube.jpg')} style={styles.logo} />
      <TextInput
        style={styles.input}
        placeholder="아이디"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {isSignUpMode ? ( // 회원가입 모드일 때만 회원가입 창 표시
        <>
          <TextInput
            style={styles.input}
            placeholder="비밀번호 확인"
            secureTextEntry
            // ... (비밀번호 확인 관련 상태 및 핸들러)
          />
          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={toggleSignUpMode}>
            <Text style={styles.loginButtonText}>로그인화면으로 돌아가기</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupButton} onPress={toggleSignUpMode}>
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </>
      )}

    </View>
  );
};

const Stopwatch = ({onStop, onRecord}) => {//스톱워치
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const handleToggle = () => {
    if (running) {
      clearInterval(intervalId);
      if (time > 0) {
        onRecord(formatTime(time)); // 레코드 추가
      }
      setTime(0);
    } else {
      setTime(0);
     // const today = new Date();
      const startTime = Date.now() - time;
      const id = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
      setIntervalId(id);
    }
    setRunning(!running);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onStop();
      return true; 
    });

    return () => {
      backHandler.remove();
      clearInterval(intervalId);      
    };
  }, [intervalId, onStop]);


  const formatTime = (milliseconds) => {// 스톱워치 기록 시간
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = (milliseconds / 10 % 100 % 99).toFixed(0); // %100으로 하니 가끔 밀리초가 100가 되는경우생김
    //const ms = Math.floor(milliseconds % 1000 / 10);

    const formattedMinutes = minutes.toString().padStart(2, '0');// 자릿수 맞추기
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedms = ms.toString().padStart(2, '0');
    return `${formattedMinutes} : ${formattedSeconds} : ${formattedms}`;
  };

  return (
    <View style={styles.stopwatchContainer}>
      <Text style={styles.stopwatchText}>{formatTime(time)}</Text>
      <TouchableOpacity
        style={styles.stopwatchButton}
        onPress={handleToggle}
      >
        <Text style={styles.stopwatchButtonText}>
          {running ? 'STOP' : 'START'/*추후 stop 을 누르면 reset 과 record 버튼으로 나누는 기능 추가?*/}
        </Text>
      </TouchableOpacity>
    </View>
  );
};



const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState('Home');
  const [stopwatchRecords, setStopwatchRecords] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [RecordTop, setRecordTop] = useState([]);
  const [RecordBottom, setRecordBottom] = useState([]);
  





  const firstRunDate = new Date('2023-09-01'); // 예시로 설정

  const getCurrentDate = () => {
    return new Date();
  };

  const calculateDayN = () => {
    const currentDate = getCurrentDate();
    const timeDifference = currentDate - firstRunDate;
    const dayN = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // 24시간 = 1일
    return dayN + 1; 
  };
  const [dayN, setDayN] = useState(calculateDayN());


  useEffect(() => {
    // 1분마다 Day N을 업데이트
    const interval = setInterval(() => {
      setDayN(calculateDayN());
    }, 60 * 1000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);


  const openSurvey = async () => {
      if (isEnabled) {
        // 버튼이 활성화된 경우
        setIsEnabled(false); // 버튼 비활성화
        await saveButtonState(false);
  
        // URL로 이동
        Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSeC2el0xVkleIVe6jKK_ir2xLUx8BMoLtS559VtkWrPiWzSfQ/viewform');
        
        // 1일(24시간) 뒤에 버튼을 다시 활성화.. 를 하려했는데 비활성화는 안된다. URL 은정상적으로 돌아감
        setTimeout(async () => {
          setIsEnabled(true);
          await saveButtonState(true);
        }, 24 * 60 * 60 * 1000); // 24시간(ms 단위)
      } else {
        // 버튼이 비활성화된 경우
        Linking.openURL('https://docs.google.com/forms/d/1EEoGtVf-zoXR59wv7zEh4h0YVjJZo2I21ytkfXIaxBg/edit');
      }
  };







  const CubeBest = () => {
    setScreen('CubeBestScreen');
  };
  const StacksBest = () => {
    setScreen('StacksBestScreen');
  };


  const handleRecord = (record) => {//스톱워치 각자 기록
    if (screen === 'TopScreen') {
      setRecordTop([...RecordTop, record]);
    } else if (screen === 'BottomScreen') {
      setRecordBottom([...RecordBottom, record]);
    }  
  };


  const handleSignUpComplete = () => {//회원가입완료 필요한가?
    setLoggedIn(true);
  };



  const handleLogin = () => {//로그인완료
    setLoggedIn(true);
  };

  const handleLogout = () => {//로그아웃 필요한가
    setLoggedIn(false);
    setScreen('Home');
  };

  const handleStopwatchClose = () => {
    setScreen('Home');
  };

  const handleTouchTop = () => {
    if (screen === 'Home') {
      setScreen('TopScreen');
    } else if (screen === 'TopScreen') {
      setScreen('Home');
    }
  };

  const handleTouchBottom = () => {
    if (screen === 'Home') {
      setScreen('BottomScreen');
    } else if (screen === 'BottomScreen') {
      setScreen('Home');
    }
  };

  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1; 
  const day = d.getDate();

  //DAY n 을 위해 날짜 받아주기?


  

  const renderScreen = () => {
    if (screen === 'Home') {//로그인후 홈화면
      return (
        <View style={styles.container}>
          <TouchableOpacity style={styles.topHalf} onPress={handleTouchTop} >
                <Image source={require('./assets/cube.jpg')} style={styles.logo} />
                </TouchableOpacity>      
          <TouchableOpacity style={styles.bottomHalf} onPress={handleTouchBottom}>
                 <Image source={require('./assets/stacks.jpg')} style={styles.logo} />
                </TouchableOpacity>   
        </View>
      );
    } else if (screen === 'TopScreen' ) {//cube 
      return (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('Home')}
          >
            <Text style={styles.backButtonText}> Back </Text>
          </TouchableOpacity>

          <View style={styles.container} backgroundColor ='#FFE4C4'>
            <Text style={styles.header}>{month}월 {day}일 (Day {dayN})</Text>
            <Stopwatch onRecord={handleRecord} style={alignItems= 'center'} />
          </View>
          <TouchableOpacity
            style={styles.CubeBestButton}
            onPress={CubeBest}
          >
            <Text style={styles.CubeBestButtonText}> Best </Text>
          </TouchableOpacity>

            <View style={styles.second_container} backgroundColor = '#FFE4B5'>

            <ScrollView style={styles.second_container} backgroundColor = '#DEB887'>
              <Text style={styles.header}>스탑워치</Text>
                {RecordTop.map((record, index) => (
                  <Text key={index} style={styles.header}>
                    Day {dayN} {record} 
                  </Text>
                ))}
            
            </ScrollView>
            </View>

        </View>
      );
    }
    else if ( screen === 'BottomScreen') {//stacks
      return (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('Home')}
          >
            <Text style={styles.backButtonText}> Back </Text>
            </TouchableOpacity>

          <View style={styles.container} backgroundColor ='#FFE4C4'>
            <Text style={styles.header}>{month}월 {day}일 (Day {dayN})</Text>
            <Stopwatch onRecord={handleRecord} style={alignItems= 'center'} />

          </View>
          <TouchableOpacity
            style={styles.StacksBestButton}
            onPress={StacksBest}
          >
            <Text style={styles.StacksBestButtonText}> Best </Text>
          </TouchableOpacity>
            <View style={styles.second_container} backgroundColor = '#FFE4B5'>

            <ScrollView style={styles.second_container} backgroundColor = '#DEB887'>
              <Text style={styles.header}>스탑워치</Text>
                {RecordBottom.map((record, index) => (
                  <Text key={index} style={styles.header}>
                    Day {dayN} {record}
                  </Text>
                ))}
            
            </ScrollView>
            </View>

        </View>
      );
    }
    else if ( screen == 'CubeBestScreen'){//cube 최고기록
      return (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('TopScreen')}
            >
            <Text style={styles.backButtonText}> Back </Text>
          </TouchableOpacity>
          <View style={styles.container} backgroundColor ='#FFE4C4'>
            <Text style={styles.header}>{month}월 {day}일 (Day {dayN})</Text>
          </View>

          <View style={styles.best_container} backgroundColor = '#FFE4B5'>

            <ScrollView style={styles.best_container} backgroundColor = '#DEB887'>
              <Text style={styles.header}>스탑워치</Text>
              {RecordTop.map((record, index) => (
                <Text key={index} style={styles.header}>
                  {/* 9월 1일           {record} */}
                  Day {dayN} {record}
                </Text>
              ))}

            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.ReviewButton}
            onPress={openSurvey}
            >
            <Text style={styles.ReviewButtonText}> 설문조사 </Text>
          </TouchableOpacity>

        </View>
      );
    }
    else if (screen == 'StacksBestScreen'){//stacks 최고기록
      return (
        <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setScreen('BottomScreen')}
          >
          <Text style={styles.backButtonText}> Back </Text>
        </TouchableOpacity>
        <View style={styles.container} backgroundColor ='#FFE4C4'>
          <Text style={styles.header}>{month}월 {day}일 (Day {dayN})</Text>
        </View>

        <View style={styles.best_container} backgroundColor = '#FFE4B5'>

          <ScrollView style={styles.best_container} backgroundColor = '#DEB887'>
          <Text style={styles.header}>스탑워치</Text>
            {RecordBottom.map((record, index) => (
            <Text key={index} style={styles.header}>
             {/* 9월 1일           {record} */}
             Day {dayN} {record}
            </Text>
            ))}

          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.ReviewButton}
          onPress={openSurvey}
          >
          <Text style={styles.ReviewButtonText}> 설문조사 </Text>
        </TouchableOpacity>

        </View>
      );
    }

  };
  
  return (
    <View style={styles.container}>
      <StatusBar animated={true} backgroundColor="white" barStyle="dark-content" />

      {loggedIn ? (
        renderScreen()
      ) : (
        <MainScreen onLogin={handleLogin} />
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  second_container: {
    flex: 3,
  },
  best_container: {
    flex: 15,
  },
  topHalf: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
        
    
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',    
    resizeMode: 'contain',
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    justifyContent: 'space-around',
    alignItems: 'space-around', 
    zIndex: 1,
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5, 
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
  },
  CubeBestButton: {
    position: 'absolute',
    right: 0, 
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  CubeBestButtonText: {
    fontSize: 20,
    color: 'white',
  },
  StacksBestButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  StacksBestButtonText: {
    fontSize: 20,
    color: 'white',
  },
  stopwatchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopwatchText: {
    fontSize: 60,
    marginBottom: 20,
  },
  stopwatchButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 5,
    width: 380,
    justifyContent: 'center',
    alignItems: 'center', 
    bottom: 10, 
  },
  stopwatchButtonText: {
    fontSize: 18,

  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    width: 320,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
  },    
  signupButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    width: 320,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
  },  

  stopwatchValue: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  ReviewButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5,
    zIndex: 1,
    height: 43,
    width: 90,
    disabled: true,
  },
  ReviewButtonText: {
    fontSize: 18,
    color: 'white',
  },
  ReviewdisabledButton:{
    backgroundColor: 'gray', // 비활성화된 상태의 스타일
  }
});

export default App;