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

// 選択肢の定義
const GENDER_OPTIONS = ["男性", "女性", "その他"];
const AGE_OPTIONS = ["10代", "20代", "30代", "40代", "50代", "60代", "70代", "80代以上"];
const EC_OPTIONS = ["全く利用しない", "あまり利用しない", "月に数回程度利用する", "週に数回程度利用する", "ほぼ毎日利用する"];

export default function App() {
  // 画面遷移を管理 ('consent' -> 'preSurvey' -> 'survey' -> 'postSurvey' -> 'email')
  const [screen, setScreen] = useState('consent');

  // 事前アンケート用のステート
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState(null);

  // アンケート本番用のステート
  const [displayImage, setDisplayImage] = useState(null);
  const [selectCount, setSelectCount] = useState(0);
  const [results, setResults] = useState([]); 
  const [selectedCause, setSelectedCause] = useState(null); 
  
  // 事後アンケート用のステート
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
    setGender(null);
    setAge(null);
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
        gender: gender,     // 追加：性別
        age: age,           // 追加：年齢
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
          <TouchableOpacity style={styles.consentButton} onPress={() => setScreen('preSurvey')}>
            <Text style={styles.consentButtonText}>同意して開始する</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ② 事前アンケート画面
  // ==========================================
  if (screen === 'preSurvey') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.finishedTitle}>事前アンケート</Text>
          <Text style={styles.finishedSubTitle}>はじめにご自身の属性について教えてください。</Text>

          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>1. 性別</Text>
            <View style={styles.rowContainer}>
              {GENDER_OPTIONS.map((opt, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.thirdOptionButton, gender === opt && styles.optionButtonSelected]} 
                  onPress={() => setGender(opt)}
                >
                  <Text style={[styles.optionButtonText, gender === opt && styles.optionButtonTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>2. 年齢</Text>
            <View style={styles.rowContainer}>
              {AGE_OPTIONS.map((opt, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.halfOptionButton, age === opt && styles.optionButtonSelected]} 
                  onPress={() => setAge(opt)}
                >
                  <Text style={[styles.optionButtonText, age === opt && styles.optionButtonTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.nextButton, (!gender || !age) && styles.nextButtonDisabled]} onPress={() => setScreen('survey')} disabled={!gender || !age}>
            <Text style={styles.nextButtonText}>次へ</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ③ 事後アンケート画面
  // ==========================================
  if (screen === 'postSurvey') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.finishedTitle}>事後アンケート</Text>
          <Text style={styles.finishedSubTitle}>ご回答お疲れ様でした。最後に以下の質問にお答えください。</Text>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>1. ECサイト（Amazon、楽天など）の使用頻度を教えてください。</Text>
            {EC_OPTIONS.map((option, idx) => (
              <TouchableOpacity key={idx} style={[styles.optionButton, ecUsage === option && styles.optionButtonSelected]} onPress={() => setEcUsage(option)}>
                <Text style={[styles.optionButtonText, ecUsage === option && styles.optionButtonTextSelected]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>2. 本アンケート実験の感想をご自由にご記入ください。</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={4} placeholder="感想はこちらにご記入ください（任意）" value={feedback} onChangeText={setFeedback} />
          </View>
          
          <TouchableOpacity style={[styles.nextButton, !ecUsage && styles.nextButtonDisabled]} onPress={() => setScreen('email')} disabled={!ecUsage}>
            <Text style={styles.nextButtonText}>次へ</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ④ メール入力画面
  // ==========================================
  if (screen === 'email') {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedTitle}>最後のステップ</Text>
          <Text style={styles.finishedSubTitle}>報酬のお支払い等に必要なメールアドレスをご入力ください。</Text>
          <TextInput style={styles.emailInput} placeholder="example@mail.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TouchableOpacity style={styles.submitButton} onPress={submitToCloud} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>回答を送信して終了する</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ⑤ アンケート本番画面
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
  
  // アンケート共通
  questionText: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, alignSelf: 'flex-start' },
  nextButton: { backgroundColor: '#007AFF', width: '100%', maxWidth: 500, padding: 16, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  nextButtonDisabled: { backgroundColor: '#A2C8F2' },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // 本番用
  progressText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginBottom: 15 },
  singleCard: { width: width * 0.8, maxWidth: 400, aspectRatio: 1.5, backgroundColor: 'white', padding: 10, borderRadius: 12, elevation: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  ratingImage: { width: '100%', height: '100%' },
  causeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 500, marginBottom: 30 },
  causeButton: { flex: 1, backgroundColor: 'white', padding: 15, marginHorizontal: 5, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', alignItems: 'center' },
  causeButtonSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  causeButtonText: { fontSize: 15, fontWeight: 'bold' },
  causeButtonTextSelected: { color: '#007AFF' },

  // 事前・事後アンケート共通
  sectionContainer: { width: '100%', maxWidth: 500, marginBottom: 30 },
  rowContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  thirdOptionButton: { width: '31%', paddingVertical: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  halfOptionButton: { width: '48%', paddingVertical: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  optionButton: { padding: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, width: '100%' },
  optionButtonSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  optionButtonText: { fontSize: 15, fontWeight: 'bold', color: '#555' },
  optionButtonTextSelected: { color: '#007AFF' },
  textArea: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },

  // 終了前メールアドレス入力
  finishedContainer: { width: '85%', maxWidth: 500, alignItems: 'center' },
  finishedTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  finishedSubTitle: { fontSize: 16, marginBottom: 30, textAlign: 'center' },
  emailInput: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 30 },
  submitButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 25, width: '100%', alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});