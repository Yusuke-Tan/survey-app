import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Image, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';

const MAX_SELECT = 18; 
// ★ご自身のGASのURLに置き換えてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzDXWXpfeaVsDWZ12T8-1aT-EjguNQZxUhesnLCD4WPRcMBiI4LIfhLLXByoMIVSRix/exec';

const PRODUCTS = [
  "ビデオカメラ", "ゲーム機", "小説", "英単語帳", "恋愛ドラマDVD",
  "海外ドラマの教材DVD", "アクション映画のDVD", "ドキュメンタリー映画DVD", "マンガアプリ", "動画編集アプリ",
  "ミュージカルDVD", "舞台美術の参考用DVD", "ファッション雑誌", "経済誌", "チョコレート",
  "プロテイン", "ゲーミングノートPC", "社用ノートPC"
];

const RATING_IMAGES = [
  require('./assets/1.png'), require('./assets/2.png'), require('./assets/3.png'), require('./assets/4.png'), require('./assets/5.png'),
  require('./assets/6.png'), require('./assets/7.png'), require('./assets/8.png'), require('./assets/9.png'), require('./assets/10.png'),
  require('./assets/11.png'), require('./assets/12.png'), require('./assets/13.png'), require('./assets/14.png'), require('./assets/15.png'),
  require('./assets/16.png'), require('./assets/17.png'), require('./assets/18.png'), require('./assets/19.png'), require('./assets/20.png'),
  require('./assets/21.png'), require('./assets/22.png'), require('./assets/23.png'), require('./assets/24.png'), require('./assets/25.png'),
  require('./assets/26.png'), require('./assets/27.png'), require('./assets/28.png'), require('./assets/29.png'), require('./assets/30.png'),
  require('./assets/31.png'), require('./assets/32.png'), require('./assets/33.png'), require('./assets/34.png'), require('./assets/35.png'),
  require('./assets/36.png'), require('./assets/37.png'), require('./assets/38.png'), require('./assets/39.png'), require('./assets/40.png'),
];

const EC_OPTIONS = [
  "全く利用しない",
  "あまり利用しない",
  "月に数回程度利用する",
  "週に数回程度利用する",
  "ほぼ毎日利用する"
];

export default function App() {
  const [screen, setScreen] = useState('consent');

  const [displayImage, setDisplayImage] = useState(null);
  const [selectCount, setSelectCount] = useState(0);
  const [results, setResults] = useState([]); 
  const [isFinished, setIsFinished] = useState(false);
  const [selectedCause, setSelectedCause] = useState(null); 
  
  const [ecUsage, setEcUsage] = useState(null);
  const [feedback, setFeedback] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    refreshApp();
  }, []);

  const refreshApp = () => {
    // 高分散の評価画像のみを抽出 (奇数インデックス: 0, 2, 4...)
    const oddIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38];
    const randomOddIndex = oddIndices[Math.floor(Math.random() * oddIndices.length)];
    
    setDisplayImage(RATING_IMAGES[randomOddIndex]);
    setSelectedCause(null);
  };

  const handleNext = () => {
    const currentAnswer = {
      chosenOption: '高分散', 
      chosenCause: selectedCause
    };
    
    setResults(prev => [...prev, currentAnswer]);
    const nextCount = selectCount + 1;
    setSelectCount(nextCount);

    if (nextCount >= MAX_SELECT) {
      setScreen('postSurvey');
    } else {
      refreshApp();
    }
  };

  const resetAndGoHome = () => {
    setSelectCount(0);
    setResults([]);
    setEmail(''); 
    setEcUsage(null);
    setFeedback('');
    refreshApp();
    setScreen('consent');
  };

  const submitToCloud = async () => {
    if (!email.trim()) {
      if (Platform.OS === 'web') {
        window.alert("メールアドレスを入力してください。");
      } else {
        Alert.alert("確認", "メールアドレスを入力してください。");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        email: email.trim(),
        answers: results,
        ecUsage: ecUsage,
        feedback: feedback
      };

      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify(payload)
      });

      if (Platform.OS === 'web') {
        window.alert("データは送信されました");
        resetAndGoHome();
      } else {
        Alert.alert("送信完了", "データは送信されました", [
          { text: "OK", onPress: resetAndGoHome }
        ]);
      }
      
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("データの送信に失敗しました。電波の良いところで再度お試しください。");
      } else {
        Alert.alert("通信エラー", "データの送信に失敗しました。電波の良いところで再度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentProduct = PRODUCTS[selectCount] || "商品";

  // ==========================================
  // ① 同意画面
  // ==========================================
  if (screen === 'consent') {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <View style={styles.cardFull}>
          <Text style={styles.consentTitle}>アンケートご協力のお願い</Text>
          <Text style={styles.consentText}>
            本アンケートでは、提示された商品を購入・利用する場面を想定して、評価画像に対する判断を行っていただきます。{'\n\n'}
            ・全18問の設問があります。{'\n'}
            ・直感でお答えください。{'\n'}
            ・収集したデータは研究目的のみに使用されます。{'\n\n'}
            上記の内容をご確認の上、同意いただける場合は「同意して開始する」を押してください。
          </Text>
          <TouchableOpacity style={styles.consentButton} onPress={() => setScreen('survey')}>
            <Text style={styles.consentButtonText}>同意して開始する</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ② 事後アンケート
  // ==========================================
  if (screen === 'postSurvey') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.finishedTitle}>事後アンケート</Text>
          <Text style={styles.finishedSubTitle}>ご回答お疲れ様でした。最後に以下の質問にお答えください。</Text>
          <View style={styles.postSurveySection}>
            <Text style={styles.questionText}>1. ECサイトの使用頻度</Text>
            {EC_OPTIONS.map((option, idx) => (
              <TouchableOpacity key={idx} style={[styles.optionButton, ecUsage === option && styles.optionButtonSelected]} onPress={() => setEcUsage(option)}>
                <Text style={[styles.optionButtonText, ecUsage === option && styles.optionButtonTextSelected]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.postSurveySection}>
            <Text style={styles.questionText}>2. 感想をご記入ください。</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={4} value={feedback} onChangeText={setFeedback} />
          </View>
          <TouchableOpacity style={[styles.nextButton, !ecUsage && styles.nextButtonDisabled]} onPress={() => setScreen('email')} disabled={!ecUsage}>
            <Text style={styles.nextButtonText}>次へ</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ③ メール入力
  // ==========================================
  if (screen === 'email') {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedTitle}>最後のステップ</Text>
          <TextInput style={styles.emailInput} placeholder="example@mail.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TouchableOpacity style={styles.submitButton} onPress={submitToCloud} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>回答を送信して終了する</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ④ アンケート本番
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.progressText}>Q{selectCount + 1} / {MAX_SELECT}</Text>
        <Text style={styles.questionText}>「{currentProduct}」の低評価（★1、2）の原因は、主にどちらにあると感じますか？</Text>
        
        <View style={styles.singleCard}>
          <Image source={displayImage} style={styles.ratingImage} resizeMode="contain" />
        </View>

        <View style={styles.causeContainer}>
          <TouchableOpacity style={[styles.causeButton, selectedCause === 'product' && styles.causeButtonSelected]} onPress={() => setSelectedCause('product')}>
            <Text style={[styles.causeButtonText, selectedCause === 'product' && styles.causeButtonTextSelected]}>商品・サービス</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.causeButton, selectedCause === 'reviewer' && styles.causeButtonSelected]} onPress={() => setSelectedCause('reviewer')}>
            <Text style={[styles.causeButtonText, selectedCause === 'reviewer' && styles.causeButtonTextSelected]}>レビュワー</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.nextButton, !selectedCause && styles.nextButtonDisabled]} onPress={handleNext} disabled={!selectedCause}>
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', paddingTop: 40 },
  containerCenter: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { alignItems: 'center', padding: 15 },
  cardFull: { width: '85%', maxWidth: 500, backgroundColor: 'white', padding: 30, borderRadius: 12, elevation: 3, alignItems: 'center' },
  consentTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  consentText: { fontSize: 15, marginBottom: 30 },
  consentButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  consentButtonText: { color: 'white', fontWeight: 'bold' },
  singleCard: { width: width * 0.8, aspectRatio: 1.5, backgroundColor: 'white', padding: 10, borderRadius: 12, elevation: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  ratingImage: { width: '100%', height: '100%' },
  questionText: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  causeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  causeButton: { flex: 1, backgroundColor: 'white', padding: 15, marginHorizontal: 5, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', alignItems: 'center' },
  causeButtonSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  causeButtonText: { fontSize: 15, fontWeight: 'bold' },
  causeButtonTextSelected: { color: '#007AFF' },
  nextButton: { backgroundColor: '#007AFF', width: '90%', padding: 16, borderRadius: 30, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#A2C8F2' },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  postSurveySection: { width: '100%', marginBottom: 30 },
  optionButton: { padding: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  optionButtonSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  optionButtonText: { fontSize: 16 },
  optionButtonTextSelected: { color: '#007AFF' },
  textArea: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, height: 100 },
  finishedContainer: { width: '85%', maxWidth: 500, alignItems: 'center' },
  finishedTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  finishedSubTitle: { fontSize: 16, marginBottom: 30 },
  emailInput: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 30 },
  submitButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 25, width: '100%', alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});