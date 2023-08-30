import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, ScrollView, StyleSheet, TouchableOpacity, TextInput, BackHandler, Image } from 'react-native';
import axios from 'axios'; // Axios 라이브러리 import


const MainScreen = ({ onLogin, onSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false); // 추가

  const handleLogin = () => {
    if (username === 'user' && password === 'password') {
      onLogin();
    } else {
      alert('로그인 실패');
    }
  };

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

  const handleSignUp = async () => {
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

const Stopwatch = ({onStop, onRecord}) => {
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

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = (milliseconds / 10 % 100 % 99).toFixed(0); 
    //const ms = Math.floor(milliseconds % 1000 / 10);

    const formattedMinutes = minutes.toString().padStart(2, '0');
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
          {running ? 'STOP' : 'START'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};



const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState('Home');
  const [stopwatchRecords, setStopwatchRecords] = useState([]);


  const handleRecord = (record) => {
    setStopwatchRecords(prevRecords => [...prevRecords, record]);
  };


  const handleSignUpComplete = () => {
    setLoggedIn(true);
  };



  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
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




  

  const renderScreen = () => {
    if (screen === 'Home') {
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
    } else if (screen === 'TopScreen' ) {
      return (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('Home')}
          >
            <Text style={styles.backButtonText}> Back </Text>
            </TouchableOpacity>

          <View style={styles.container} backgroundColor ='#FFE4C4'>
            <Text style={styles.header}>{year}년 {month}월 {day}일</Text>
            <Stopwatch onRecord={handleRecord} style={alignItems= 'center'} />
  
            </View>
            <View style={styles.second_container} backgroundColor = '#FFE4B5'>

            <ScrollView style={styles.second_container} backgroundColor = '#DEB887'>
              <Text style={styles.header}>스탑워치</Text>
                {stopwatchRecords.map((record, index) => (
                  <Text key={index} style={styles.header}>
                    {record} Cube
                  </Text>
                ))}
            
            </ScrollView>
            </View>

        </View>
      );
    }
    else if ( screen === 'BottomScreen') {
      return (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('Home')}
          >
            <Text style={styles.backButtonText}> Back </Text>
            </TouchableOpacity>

          <View style={styles.container} backgroundColor ='#FFE4C4'>
            <Text style={styles.header}>{year}년 {month}월 {day}일</Text>
            <Stopwatch onRecord={handleRecord} style={alignItems= 'center'} />
  
            </View>
            <View style={styles.second_container} backgroundColor = '#FFE4B5'>

            <ScrollView style={styles.second_container} backgroundColor = '#DEB887'>
              <Text style={styles.header}>스탑워치</Text>
                {stopwatchRecords.map((record, index) => (
                  <Text key={index} style={styles.header}>
                    {record}
                  </Text>
                ))}
            
            </ScrollView>
            </View>

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
  },
  stopwatchButtonText: {
    fontSize: 16,
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
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },    
  signupButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,

  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
  },  

  stopwatchValue: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default App;