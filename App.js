import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Image, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';

const MAX_SELECT = 18; 
// ★ご自身のGASのURLに置き換えてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzDXWXpfeaVsDWZ12T8-1aT-EjguNQZxUhesnLCD4WPRcMBiI4LIfhLLXByoMIVSRix/exec';

// 更新された商品リスト（18種類）
const PRODUCTS = [
  "印刷機", "ステレオスピーカー", "ドキュメンタリー映画", "コメディ映画", "業務用ノートパソコン",
  "娯楽用タブレット", "果物", "ケーキ", "科学雑誌", "エンタメ雑誌",
  "古典劇", "ロマンス劇", "業務アプリ", "娯楽用アプリ", "ノンフィクションドラマ",
  "恋愛ドラマ", "教科書", "マンガ"
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

// 選択肢の定義を更新
const GENDER_OPTIONS = ["男性", "女性", "その他", "回答しない"];
const AGE_OPTIONS = ["10代", "20代", "30代", "40代", "50代", "60代以上", "回答しない"];
const EC_OPTIONS = ["週に数回", "月に数回", "2〜3ヶ月に1回", "半年に1回", "年に1回以下（または全く利用しない）"];

const CAUSE_OPTIONS = [
  "商品に問題がある",
  "どちらかといえば商品に問題がある",
  "どちらともいえない",
  "どちらかといえばレビューした人に問題がある",
  "レビューした人に問題がある"
];

export default function App() {
  const [screen, setScreen] = useState('consent');

  const [shuffledProducts, setShuffledProducts] = useState([]);
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState(null);

  const [displayImage, setDisplayImage] = useState(null);
  const [selectCount, setSelectCount] = useState(0);
  const [results, setResults] = useState([]); 
  const [selectedCause, setSelectedCause] = useState(null); 
  
  const [ecUsage, setEcUsage] = useState(null);
  const [feedback, setFeedback] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // 起動時に商品の表示順をランダムにシャッフルする
    const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
    setShuffledProducts(shuffled);
    refreshApp();
  }, []);

  const refreshApp = () => {
    // 奇数インデックスの画像（高分散など特定の条件）からランダムに1つ選ぶロジックを維持
    const oddIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38];
    const randomOddIndex = oddIndices[Math.floor(Math.random() * oddIndices.length)];
    
    setDisplayImage(RATING_IMAGES[randomOddIndex]);
    setSelectedCause(null);
  };

  const handleNext = () => {
    const currentAnswer = {
      product: shuffledProducts[selectCount],
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
    const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
    setShuffledProducts(shuffled);
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
        gender: gender,
        age: age,
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

  // シャッフルされた配列から現在の設問の商品を取得
  const currentProduct = shuffledProducts[selectCount] || "商品";

  // ==========================================
  // ① 同意画面
  // ==========================================
  if (screen === 'consent') {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <View style={styles.cardFull}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.consentTitle}>アンケートご協力のお願い</Text>
            <Text style={styles.consentText}>
              このアンケートは、インターネット上の購買に関するアンケートです。{'\n'}
              下記の注意事項をよく読んでお答えください。{'\n\n'}
              本研究は、筑波大学図書館情報メディア系研究倫理審査委員会の承認を得て行っています.{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>1.【研究の概要】</Text>{'\n'}
              私たちは日々、AmazonなどのECサイト上で様々な商品を購入しています。こうしたECサイトの多くでは、商品へのレイティング情報が提示されており、スムーズな購買を行うことができます。{'\n'}
              しかし、私たちがどのようにレイティング情報を商品購入に結び付けているかに関しては、不明な点が多く、本研究では、評価分布を題材に、仮想的に商品購入を行ってもらい、商品の評価が購買者にどのような影響を与えているのかを調べます。{'\n'}
              この研究を通じて、人の消費心理の解明や、実際のレビューサイトの設計に貢献することが期待されます。{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>2.【研究方法】</Text> 本研究は次の通り行います{'\n'}
              1）最初に本研究に関する説明を行います。研究参加に同意していただける場合以下の手順に沿って実験に参加していただきます。{'\n'}
              2）事前アンケートへの回答をお願いします。{'\n'}
              3）評価分布を提示し、低評価が付いた理由を答えていただきます。これを18試行行っていただきます。{'\n'}
              4）最後に、事後アンケートへの回答をお願いします。{'\n\n'}
              以上、実験の所要時間は約20分を予定しています。{'\n'}
              ただし、実際には多少前後する可能性があります。{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>3.【研究実施における危険性や身体的影響】</Text>{'\n'}
              本研究には危険性や身体的影響はありませんが、集中して画面を見るため、疲労を感じる可能性があります。もし実験中に疲れを感じましたら適宜休憩をしていただいて構いません。{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>4.【取得するデータ】</Text>{'\n'}
              最初に、年齢、性別に関するアンケートに回答してもらいます。実験中はレイティングの低評価の帰属先の結果を記録します。最後に実験に関する感想、ECサイトの利用頻度についてのアンケートに回答してもらいます。質問に対して答えたくなければ無理に答えなくて結構です。{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>5.【データの利用と管理】</Text>{'\n'}
              取得したデータは研究目的にのみ使用し、個人が特定できない形で分析をいたします。データの管理に関してはクラウドストレージに保存し、研究責任者および研究実施者のみがアクセスできるようにいたします。{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>6.【参加しない自由、参加意志の撤回の自由】</Text>{'\n'}
              研究参加者は、本研究に参加しない権利、研究に参加する意思を研究実施前、実施中、実施後のいつでも撤回する権利を持ちます。また、それまでに取得されたデータの消去を要求することも可能です。これらの権利を行使することにより不利益が生じることは一切ありません。{'\n\n'}
              以上を踏まえて、私は自由意志によりこの研究に参加することに同意します。{'\n\n'}
              研究責任者 筑波大学 図書館情報メディア系 助教 藤崎樹{'\n'}
              研究実施者 筑波大学 情報学群情報メディア創成学類 ４年 丹優介{'\n'}
              S2310745@u.tsukuba.ac.jp
            </Text>

            <Text style={[styles.consentText, { fontWeight: 'bold', marginTop: 20, textAlign: 'center' }]}>
              上記の注意事項を確認し、調査の参加に同意しますか？
            </Text>

            <TouchableOpacity style={styles.consentButton} onPress={() => setScreen('preSurvey')}>
              <Text style={styles.consentButtonText}>同意する</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.consentButton, { backgroundColor: '#888', marginTop: 10 }]} 
              onPress={() => Platform.OS === 'web' ? window.alert('参加を見合わせる場合は、タブやブラウザを閉じて終了してください。') : Alert.alert('終了', '参加を見合わせる場合は、アプリを終了してください。')}
            >
              <Text style={styles.consentButtonText}>同意しない</Text>
            </TouchableOpacity>
          </ScrollView>
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

          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>年齢</Text>
            <View style={styles.rowContainer}>
              {AGE_OPTIONS.map((opt, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.thirdOptionButton, age === opt && styles.optionButtonSelected]} 
                  onPress={() => setAge(opt)}
                >
                  <Text style={[styles.optionButtonText, age === opt && styles.optionButtonTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>性別</Text>
            <View style={styles.rowContainer}>
              {GENDER_OPTIONS.map((opt, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.halfOptionButton, gender === opt && styles.optionButtonSelected]} 
                  onPress={() => setGender(opt)}
                >
                  <Text style={[styles.optionButtonText, gender === opt && styles.optionButtonTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.nextButton, (!gender || !age) && styles.nextButtonDisabled]} onPress={() => setScreen('instructions')} disabled={!gender || !age}>
            <Text style={styles.nextButtonText}>次へ</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ③ 説明画面（新規追加）
  // ==========================================
  if (screen === 'instructions') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[styles.cardFull, {width: '95%'}]}>
            <Text style={styles.finishedTitle}>実験の回答について</Text>
            <Text style={styles.consentText}>
              本研究ではオンラインショッピングサイト等で見られるレイティングの低評価（★１や２）の原因についての調査を行います。{'\n'}
              低評価の原因を以下の２つで考えたとき、表示された低評価の原因がどちらに当てはまるかを考えて回答してください。{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>・低評価の原因は商品にある</Text>{'\n'}
              （例：品質が悪い、すぐに壊れた、必要な情報が不足している）{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>・低評価の原因はレビューした人にある</Text>{'\n'}
              （例：好みじゃなかった、思っていたのと違った、悪質なクレーマーによる低評価）
            </Text>

            <Text style={[styles.questionText, {alignSelf: 'center', marginTop: 20}]}>実験の内容を理解しましたか？</Text>
            
            <TouchableOpacity style={styles.nextButton} onPress={() => setScreen('survey')}>
              <Text style={styles.nextButtonText}>内容を理解した</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ④ 事後アンケート画面
  // ==========================================
  if (screen === 'postSurvey') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.finishedTitle}>事後アンケート</Text>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>普段、どれくらいの頻度でオンラインショッピングを利用していますか？</Text>
            {EC_OPTIONS.map((option, idx) => (
              <TouchableOpacity key={idx} style={[styles.optionButton, ecUsage === option && styles.optionButtonSelected]} onPress={() => setEcUsage(option)}>
                <Text style={[styles.optionButtonText, ecUsage === option && styles.optionButtonTextSelected]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.questionText}>気づいたこと・気になったこと・感想</Text>
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
  // ⑤ メール入力画面
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
  // ⑥ アンケート本番画面
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.progressText}>質問 ({selectCount + 1} / {MAX_SELECT})</Text>
        <Text style={[styles.questionText, { fontSize: 20, textAlign: 'center', alignSelf: 'center' }]}>{currentProduct}</Text>
        
        <View style={styles.singleCard}>
          <Image source={displayImage} style={styles.ratingImage} resizeMode="contain" />
        </View>

        <Text style={styles.questionText}>低評価 （★1や★2） の原因は何であると思いますか？</Text>

        {/* 選択肢の文字数が長いため、縦並び（Column）に変更しています */}
        <View style={styles.scaleContainer}>
          {CAUSE_OPTIONS.map((option, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.scaleButton, selectedCause === option && styles.scaleButtonSelected]} 
              onPress={() => setSelectedCause(option)}
            >
              <Text style={[styles.scaleButtonText, selectedCause === option && styles.scaleButtonTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
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
  cardFull: { width: '90%', maxWidth: 600, maxHeight: '90%', backgroundColor: 'white', padding: 25, borderRadius: 12, elevation: 3 },
  consentTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  consentText: { fontSize: 14, lineHeight: 22, color: '#333' }, 
  consentButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 15 },
  consentButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // アンケート共通
  questionText: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, alignSelf: 'flex-start' },
  nextButton: { backgroundColor: '#007AFF', width: '100%', maxWidth: 500, padding: 16, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  nextButtonDisabled: { backgroundColor: '#A2C8F2' },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // 本番用
  progressText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  singleCard: { width: width * 0.85, maxWidth: 450, aspectRatio: 1.5, backgroundColor: 'white', padding: 10, borderRadius: 12, elevation: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  ratingImage: { width: '100%', height: '100%' },

  // ★ 5段階評価の縦並び用スタイル（文字数が長いため）
  scaleContainer: {
    flexDirection: 'column', // 縦並びに変更
    width: '100%',
    maxWidth: 600,
    marginBottom: 20,
  },
  scaleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10, // ボタン同士の縦の隙間
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
  },
  scaleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
  },
  scaleButtonTextSelected: {
    color: '#007AFF',
  },

  // 事前・事後アンケート共通の選択肢ボタン
  sectionContainer: { width: '100%', maxWidth: 500, marginBottom: 25 },
  rowContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  thirdOptionButton: { width: '31%', paddingVertical: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  halfOptionButton: { width: '48%', paddingVertical: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  optionButton: { padding: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, width: '100%', alignItems: 'center' },
  optionButtonSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  optionButtonText: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  optionButtonTextSelected: { color: '#007AFF' },
  textArea: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, minHeight: 120, textAlignVertical: 'top' },

  finishedTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  finishedSubTitle: { fontSize: 16, marginBottom: 25, textAlign: 'center', color: '#555' },
  finishedContainer: { width: '85%', maxWidth: 500, alignItems: 'center' },
  emailInput: { width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 30 },
  submitButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 25, width: '100%', alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});