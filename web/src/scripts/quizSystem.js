/**
 * Quiz System for Circular World
 * Random events that test player's knowledge and reward with points
 */
export class QuizSystem {
  constructor() {
    this.questions = [
      {
        text: 'Which of the following describes the linear economy model?',
        options: [
          'Take - Make - Waste',
          'Take - Make - Recycle',
          'Reduce - Reuse - Recycle',
          'Make - Waste - Take'
        ],
        correctIndex: 0,
        explanation: 'Linear economy extracts resources, makes products, and ultimately throws them away (Take-Make-Waste). Circular economy tries to make this cyclical.'
      },
      {
        text: 'What does the 3R rule stand for?',
        options: [
          'Read, Write, Run',
          'Reduce, Reuse, Recycle',
          'Remove, Replace, Repair',
          'Respect, Reflect, React'
        ],
        correctIndex: 1,
        explanation: '3R: Reduce (consumption), Reuse (use again), Recycle (convert waste into material) are the foundations of circular economy.'
      },
      {
        text: 'What is Industrial Symbiosis?',
        options: [
          'Factories being in the same location',
          'One factory\'s waste being another\'s raw material',
          'Factories sharing workers',
          'Only using renewable energy'
        ],
        correctIndex: 1,
        explanation: 'Industrial Symbiosis is when the waste (or byproduct) of one facility/sector becomes the raw material for another, just like in nature.'
      },
      {
        text: 'What is the primary goal of circular economy?',
        options: [
          'Providing infinite growth',
          'Producing more cheap products',
          'Eliminating waste and keeping resources in continuous use',
          'Only banning plastic use'
        ],
        correctIndex: 2,
        explanation: 'The primary goal of circular economy is to eliminate waste and pollution by design and keep materials in the cycle at their highest value.'
      },
      {
        text: 'What is planned obsolescence?',
        options: [
          'Designing products to last a long time',
          'Designing products to be short-lived so a new one is needed',
          'Putting old products in museums',
          'Planned closure of factories'
        ],
        correctIndex: 1,
        explanation: 'Planned obsolescence is when the linear economy deliberately designs products to be short-lived to keep consumption alive.'
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
          '✅ Correct Answer!', 
          `Congratulations! ${this.currentQuestion.explanation}<br><br><b>Reward:</b> +Education, +Wellbeing, +Sustainability, +500💰, +20 XP`, 
          'success'
        );
      }
    } else {
      this.consecutiveCorrect = 0;
      
      if (window.ui) {
        window.ui.showNotification(
          '❌ Incorrect Answer', 
          `Learning opportunity: ${this.currentQuestion.explanation}`, 
          'info'
        );
      }
    }

    this.currentQuestion = null;
    return isCorrect;
  }
}
