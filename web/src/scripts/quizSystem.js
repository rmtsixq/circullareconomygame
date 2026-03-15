/**
 * Quiz System for Circular World
 * Random events that test player's knowledge and reward with points
 */
export class QuizSystem {
  constructor() {
    this.questions = [
      {
        text: 'Aşağıdakilerden hangisi lineer ekonomi modelini tanımlar?',
        options: [
          'Al - Yap - At',
          'Al - Yap - Geri Dönüştür',
          'Azalt - Yeniden Kullan - Geri Dönüştür',
          'Yap - At - Al'
        ],
        correctIndex: 0,
        explanation: 'Lineer ekonomi kaynakları çıkarır, ürün yapar ve sonunda çöpe atar (Al-Yap-At). Circular ekonomi ise bunu döngüsel hale getirmeye çalışır.'
      },
      {
        text: '3R kuralı aşağıdakilerden hangisini simgeler?',
        options: [
          'Read, Write, Run',
          'Reduce, Reuse, Recycle (Azalt, Yeniden Kullan, Geri Dönüştür)',
          'Remove, Replace, Repair',
          'Respect, Reflect, React'
        ],
        correctIndex: 1,
        explanation: '3R: Reduce (tüketimi azalt), Reuse (yeniden kullan), Recycle (geri dönüştür) circular ekonominin temelidir.'
      },
      {
        text: 'Endüstriyel Simbiyoz nedir?',
        options: [
          'Fabrikaların aynı yerde olması',
          'Bir fabrikanın atığının diğerinin hammaddesi olması',
          'Fabrikaların işçileri paylaşması',
          'Sadece yenilenebilir enerji kullanılması'
        ],
        correctIndex: 1,
        explanation: 'Endüstriyel Simbiyoz, tıpkı doğadaki gibi bir tesisin/sektörün atığının (veya yan ürününün) başka bir tesisin hammaddesi olmasıdır.'
      },
      {
        text: 'Döngüsel ekonominin temel amacı nedir?',
        options: [
          'Sonsuz büyüme sağlamak',
          'Daha çok ucuz ürün üretmek',
          'Atığı ortadan kaldırmak ve kaynakları sürekli kullanımda tutmak',
          'Sadece plastik kullanımını yasaklamak'
        ],
        correctIndex: 2,
        explanation: 'Döngüsel ekonominin temel amacı atık ve kirliliği tasarımla ortadan kaldırmak ve malzemeleri en yüksek değerde döngüde tutmaktır.'
      },
      {
        text: 'Planlı eskitme (planned obsolescence) nedir?',
        options: [
          'Ürünlerin uzun süre dayanacak şekilde tasarlanması',
          'Ürünlerin bilerek kısa ömürlü tasarlanıp yenisine ihtiyaç duyulması',
          'Eski ürünlerin müzelere konulması',
          'Fabrikaların planlı olarak kapatılması'
        ],
        correctIndex: 1,
        explanation: 'Planlı eskitme, lineer ekonominin tüketimi canlı tutmak için ürünleri bilinçli olarak kısa ömürlü tasarlamasıdır.'
      }
    ];

    this.consecutiveCorrect = 0;
    this.isActive = false;
    this.currentQuestion = null;
    this.tickCounter = 0;
    this.quizInterval = 300; // Trigger quiz every 300 ticks
  }

  simulate(city, currentTick) {
    if (this.isActive) return;

    this.tickCounter++;
    if (this.tickCounter >= this.quizInterval) {
      this.tickCounter = 0;
      this.triggerQuiz();
    }
  }

  triggerQuiz() {
    this.isActive = true;
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    this.currentQuestion = this.questions[randomIndex];
    
    // Yüzde 50 ihtimalle ui'da modal gösterilir
    if (window.ui) {
      window.ui.showQuizModal(this.currentQuestion);
    }
  }

  answerQuestion(index) {
    if (!this.currentQuestion || !this.isActive) return;
    
    const isCorrect = index === this.currentQuestion.correctIndex;
    this.isActive = false;

    if (isCorrect) {
      this.consecutiveCorrect++;
      
      // Apply rewards
      if (window.scoringSystem) {
        window.scoringSystem.education = Math.min(100, window.scoringSystem.education + 2);
        window.scoringSystem.wellbeing = Math.min(100, window.scoringSystem.wellbeing + 1);
        window.scoringSystem.sustainability = Math.min(100, window.scoringSystem.sustainability + 2);
      }
      
      if (window.gameState) {
        window.gameState.addXP(20);
        window.gameState.addMoney(500); // Small bonus
      }

      if (window.ui) {
        window.ui.showNotification(
          '✅ Doğru Cevap!', 
          `Tebrikler! ${this.currentQuestion.explanation}<br><br><b>Ödül:</b> +Eğitim, +Refah, +Sürdürülebilirlik, +500💰, +20 XP`, 
          'success'
        );
      }
    } else {
      this.consecutiveCorrect = 0;
      
      if (window.ui) {
        window.ui.showNotification(
          '❌ Yanlış Cevap', 
          `Öğrenme fırsatı: ${this.currentQuestion.explanation}`, 
          'info'
        );
      }
    }

    this.currentQuestion = null;
    return isCorrect;
  }
}
