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
  // 画面遷移を管理 ('consent' -> 'survey' -> 'postSurvey' -> 'email')
  const [screen, setScreen] = useState('consent');

  const [option1, setOption1] = useState({ source: null, type: '' });
  const [option2, setOption2] = useState({ source: null, type: '' });
  const [selectCount, setSelectCount] = useState(0);
  const [results, setResults] = useState([]); 
  const [selectedOption, setSelectedOption] = useState(null); 
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
    const oddIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38];
    const evenIndices = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39];

    const randomOddIndex = oddIndices[Math.floor(Math.random() * oddIndices.length)];
    const randomEvenIndex = evenIndices[Math.floor(Math.random() * evenIndices.length)];

    if (Math.random() > 0.5) {
      setOption1({ source: RATING_IMAGES[randomOddIndex], type: '高分散' });
      setOption2({ source: RATING_IMAGES[randomEvenIndex], type: '低分散' });
    } else {
      setOption1({ source: RATING_IMAGES[randomEvenIndex], type: '低分散' });
      setOption2({ source: RATING_IMAGES[randomOddIndex], type: '高分散' });
    }
    
    setSelectedOption(null);
    setSelectedCause(null);
  };

  const handleNext = () => {
    const chosenDistributionType = selectedOption === 1 ? option1.type : option2.type;

    const currentAnswer = {
      chosenOption: chosenDistributionType, 
      chosenCause: selectedCause
    };
    
    setResults(prev => [...prev, currentAnswer]);
    const nextCount = selectCount + 1;
    setSelectCount(nextCount);

    if (nextCount >= MAX_SELECT) {
      // 本番が終了したら事後アンケート画面へ
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
        ecUsage: ecUsage, // 追加：ECサイト利用頻度
        feedback: feedback // 追加：アンケート感想
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
            本アンケートでは、提示された商品を購入・利用する場面を想定して、それぞれの評価画像に対する判断を行っていただきます。{'\n\n'}
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
  // ② 事後アンケート画面
  // ==========================================
  if (screen === 'postSurvey') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.finishedTitle}>事後アンケート</Text>
          <Text style={styles.finishedSubTitle}>ご回答お疲れ様でした。最後に以下の質問にお答えください。</Text>

          <View style={styles.postSurveySection}>
            <Text style={styles.questionText}>1. ECサイト（Amazon、楽天など）の使用頻度を教えてください。</Text>
            {EC_OPTIONS.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.optionButton, ecUsage === option && styles.optionButtonSelected]}
                onPress={() => setEcUsage(option)}
              >
                <Text style={[styles.optionButtonText, ecUsage === option && styles.optionButtonTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.postSurveySection}>
            <Text style={styles.questionText}>2. 本アンケート実験の感想をご自由にご記入ください。</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="感想はこちらにご記入ください（任意）"
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          <TouchableOpacity 
            style={[styles.nextButton, !ecUsage && styles.nextButtonDisabled]} 
            onPress={() => setScreen('email')} 
            disabled={!ecUsage}
          >
            <Text style={styles.nextButtonText}>次へ</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ③ メールアドレス入力画面
  // ==========================================
  if (screen === 'email') {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedTitle}>最後のステップ</Text>
          <Text style={styles.finishedSubTitle}>報酬のお支払い等に必要なメールアドレスをご入力ください。</Text>
          
          <Text style={styles.inputLabel}>メールアドレス</Text>
          <TextInput 
            style={styles.emailInput}
            placeholder="example@mail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={submitToCloud}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>回答を送信して終了する</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ④ アンケート本番画面
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.progressText}>Q{selectCount + 1} / {MAX_SELECT}</Text>

        <Text style={styles.questionText}>
          1. 「{currentProduct}」を購入（利用）する場合、どちらの評価の商品を選びますか？
        </Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={[styles.card, selectedOption === 1 && styles.cardSelected]} activeOpacity={0.7} onPress={() => setSelectedOption(1)}>
            <Image source={option1.source} style={styles.ratingImage} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.vsContainer}><Text style={styles.vsText}>VS</Text></View>
          <TouchableOpacity style={[styles.card, selectedOption === 2 && styles.cardSelected]} activeOpacity={0.7} onPress={() => setSelectedOption(2)}>
            <Image source={option2.source} style={styles.ratingImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.questionText}>
          2. 表示されている低評価（★1、2）の原因は、主にどちらにあると感じますか？
        </Text>

        <View style={styles.causeContainer}>
          <TouchableOpacity style={[styles.causeButton, selectedCause === 'product' && styles.causeButtonSelected]} onPress={() => setSelectedCause('product')}>
            <Text style={[styles.causeButtonText, selectedCause === 'product' && styles.causeButtonTextSelected]}>商品・サービス</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.causeButton, selectedCause === 'reviewer' && styles.causeButtonSelected]} onPress={() => setSelectedCause('reviewer')}>
            <Text style={[styles.causeButtonText, selectedCause === 'reviewer' && styles.causeButtonTextSelected]}>レビュワー</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.nextButton, (!selectedOption || !selectedCause) && styles.nextButtonDisabled]} onPress={handleNext} disabled={!selectedOption || !selectedCause}>
          <Text style={styles.nextButtonText}>{selectCount + 1 === MAX_SELECT ? "完了して結果を見る" : "次へ"}</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // 共通のコンテナスタイル
  container: { flex: 1, backgroundColor: '#f0f2f5', paddingTop: 40 },
  containerCenter: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center' },
  
  // 同意画面のカードスタイル
  cardFull: { width: '85%', maxWidth: 500, backgroundColor: 'white', padding: 30, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, alignItems: 'center' },
  consentTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  consentText: { fontSize: 15, color: '#444', lineHeight: 24, marginBottom: 30 },
  consentButton: { backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, width: '100%', alignItems: 'center' },
  consentButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // アンケート本番のスタイル
  scrollContainer: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
  progressText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginBottom: 15 },
  questionText: { fontSize: 16, fontWeight: 'bold', lineHeight: 24, color: '#333', width: '100%', marginBottom: 15 },
  cardContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginBottom: 20 },
  card: { width: width * 0.42, backgroundColor: 'white', padding: 8, borderRadius: 12, borderWidth: 3, borderColor: 'transparent', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  cardSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  ratingImage: { width: '100%', height: '100%' },
  vsContainer: { marginHorizontal: 2 },
  vsText: { fontSize: 16, fontWeight: 'bold', color: '#aaa' },
  divider: { width: '100%', height: 1, backgroundColor: '#ddd', marginVertical: 20 },
  causeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  causeButton: { flex: 1, backgroundColor: 'white', paddingVertical: 15, marginHorizontal: 5, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', alignItems: 'center' },
  causeButtonSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  causeButtonText: { fontSize: 15, fontWeight: 'bold', color: '#555' },
  causeButtonTextSelected: { color: '#007AFF' },
  nextButton: { backgroundColor: '#007AFF', width: '90%', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 10, elevation: 3 },
  nextButtonDisabled: { backgroundColor: '#A2C8F2', elevation: 0 },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // 事後アンケート画面のスタイル
  postSurveySection: { width: '100%', marginBottom: 30, maxWidth: 500 },
  optionButton: { paddingVertical: 15, paddingHorizontal: 10, backgroundColor: 'white', borderWidth: 2, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  optionButtonSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  optionButtonText: { fontSize: 16, color: '#555', fontWeight: 'bold' },
  optionButtonTextSelected: { color: '#007AFF' },
  textArea: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, minHeight: 120, textAlignVertical: 'top' },
  
  // 終了前メールアドレス入力のスタイル
  finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, width: '100%', maxWidth: 500 },
  finishedTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  finishedSubTitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  inputLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, alignSelf: 'flex-start' },
  emailInput: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 30 },
  submitButton: { backgroundColor: '#28a745', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, width: '100%', alignItems: 'center', elevation: 3 },
  submitButtonDisabled: { backgroundColor: '#88cf99', elevation: 0 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});