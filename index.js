'use strict';

const allAnimals = ['bear', 'bee', 'deer', 'dolphin', 'elephant', 'giraffe', 'hedgehog', 'koala', 'lion', 'octopus', 'otter', 'panda', 'penguin', 'seahorse', 'squirrel', 'starfish', 'turtle', 'whale'];

const game = {
    $divCards: $('#cards'),
    playerName: null,
    timerIntervalID: null,
    totalSeconds: 0,
    selectedAnimals: [],
    correctNumberPairs: 0,
    numberMoves: 0,
    firstAnimalSelected: null,
    $firstCardClicked: null,
    pairShowing: false,
    correctSound: new Audio("media/card-correct.wav"),
    wrongSound: new Audio("media/card-wrong.mp3"),

    initGame: function(){
        $('#name-input-screen').show();
        $('#level-selection-screen').hide();
        $('#game-screen').hide();
        $('#congrats-screen').hide();
        $('#input').val('');
    },

    resetGame: function(){
        window.clearInterval(this.timerIntervalID);
        this.timerIntervalID = null;
        this.totalSeconds = 0;
        this.correctNumberPairs = 0;
        this.numberMoves = 0;
        this.selectedAnimals = [];
        this.$divCards.empty();
        this.updateProgresBar();
        $('#pause-button').text('Pause');
        $('#minutes').text('00');
        $('#seconds').text('00');
        $('#number-moves').text(this.numberMoves);
        $('#accuracy').text('NA');
    },

    pauseGame: function() {
        if (this.timerIntervalID == null) {
            //when null, it is paused > want to resume
            this.timer();
            $('#pause-button').text('Pause');
        } else {
            // running > want to pause
            window.clearInterval(this.timerIntervalID);
            this.timerIntervalID = null;
            $('#pause-button').text('Resume');
        }
    },

    addPlayer: function(){
        this.playerName = $('#input').val();

        if (this.playerName.length <= 0 ){
            alert('Please enter a name');
            return;
        };

        this.levelSelection();
        $('#level-selection-screen').find('span').text(this.playerName);
    },

    levelSelection: function(){
        $('#name-input-screen').hide();
        $('#level-selection-screen').show();
    },

    gameScreen: function(numberOfCards) {
        $('#level-selection-screen').hide();
        $('#game-screen').show();
        $('#pause-button').prop( "disabled", true );

        this.$divCards.removeClass(["cards-8" , "cards-12" , "cards-18"]);
        this.$divCards.addClass(`cards-${numberOfCards}`);

        // Select randomly the cards in the array
        while (this.selectedAnimals.length < numberOfCards) {
            const randomCard = allAnimals[Math.floor(Math.random()*allAnimals.length)];
            if (!this.selectedAnimals.includes(randomCard)) {
                this.selectedAnimals.push(randomCard);
                this.selectedAnimals.push(randomCard);
            };
        }

        this.shuffleSelectedAnimals();

        for (const animalName of this.selectedAnimals) {
            const $imageCard = $('<img src="media/card-back.png">');
            this.$divCards.append($imageCard);
            $imageCard.on('click', () => {
                this.onCardClicked($imageCard, animalName);
            });
        }
    },

    onCardClicked: function($imageCard, animalName) {
        if (this.pairShowing) {
            return;
        }

        this.timer();
        $imageCard.attr('src', `media/${animalName}.png`);

        // Set for the first card turned
        if (this.firstAnimalSelected == null) {
            this.firstAnimalSelected = animalName;
            this.$firstCardClicked = $imageCard;
            return;
        }

        if (this.$firstCardClicked == $imageCard) {
            return;
        }

        this.pairShowing = true;

        if (this.firstAnimalSelected == animalName) {
            setTimeout(() => {
                this.correctSound.play()
            }, 500);
            setTimeout(() => {
                $imageCard.attr('src', 'media/card-placeholder.png');
                this.$firstCardClicked.attr('src', 'media/card-placeholder.png');

                this.pairShowing = false;
                this.firstAnimalSelected = null;
                this.$firstCardClicked = null;

                this.checkGameComplete();
            }, 2000);
            this.correctNumberPairs += 1;
            this.updateProgresBar();
        } else {
            setTimeout(() => {
                this.wrongSound.play()
            }, 500);
            setTimeout(() => {
                $imageCard.attr('src', `media/card-back.png`);
                this.$firstCardClicked.attr('src', `media/card-back.png`);

                this.pairShowing = false;
                this.firstAnimalSelected = null;
                this.$firstCardClicked = null;
            }, 2000);
        };
        this.numberMoves += 1;
        $('#number-moves').text(this.numberMoves);
        const accuracy = (this.correctNumberPairs / this.numberMoves) * 100;
        $('#accuracy').text(`${Math.round(accuracy)}%`);
    },

    checkGameComplete: function() {
        if (this.correctNumberPairs === this.selectedAnimals.length / 2) {
            $('#game-screen').hide();
            $('#congrats-screen').show();

            $('#congrats-player-name').text(this.playerName);
            const timePlayed = $('#minutes').text() + ":" + $('#seconds').text()
            $('#congrats-time-played').text(timePlayed);
            $('#congrats-number-moves').text(this.numberMoves);
            const accuracy = $('#accuracy').text();
            $('#congrats-accuracy').text(accuracy);
        }
    },

    shuffleSelectedAnimals: function(){
        for (let i = this.selectedAnimals.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.selectedAnimals[i];
            this.selectedAnimals[i] = this.selectedAnimals[j];
            this.selectedAnimals[j] = temp;
        }
    },


    timer: function(){
        if (this.timerIntervalID != null) {
            return;
        }
        $('#pause-button').text('Pause');
        $('#pause-button').prop( "disabled", false );
        let $minutesLabel = $('#minutes');
        let $secondsLabel = $('#seconds');
        this.timerIntervalID = setInterval(() => {
            this.totalSeconds++;
            const formattedSeconds = (this.totalSeconds % 60).toString().padStart(2, '0');
            $secondsLabel.text(formattedSeconds);
            const formattedMinutes = parseInt(this.totalSeconds/60).toString().padStart(2, '0');
            $minutesLabel.text(formattedMinutes);
        }, 1000);
    },

    updateProgresBar: function() {
        const $progressBar = $('.progress-bar');
        $progressBar.attr('aria-valuenow', this.correctNumberPairs);
        const totalPairs = this.selectedAnimals.length/2;
        $progressBar.attr('aria-valuemax',totalPairs);
        const progressPercent = (this.correctNumberPairs / totalPairs) * 100;
        console.log(progressPercent);
        if( isNaN(progressPercent)){
            $progressBar.width(0)
        } else {
            $progressBar.width(`${progressPercent}%`);
        }
        
    },
};


$('#start-button').on('click', () => {
    console.log('clicked');
    game.addPlayer();
    console.log("done")
});

$('#button-level-1').on('click', () => {
    game.gameScreen(8);
});

$('#button-level-2').on('click', () => {
    game.gameScreen(12);
});

$('#button-level-3').on('click', () => {
    game.gameScreen(18);
});

$('#exit-button').on('click', () => {
    game.resetGame();
    game.initGame();
});

$('#pause-button').on('click', () => {
    game.pauseGame();
});

$('#reset-game-button').on('click', () => {
    const numberOfCardsPlayed = game.selectedAnimals.length;
    game.resetGame();
    game.gameScreen(numberOfCardsPlayed);
});

$('#congrats-play-again-button').on('click', () => {
    const numberOfCardsPlayed = game.selectedAnimals.length;
    game.resetGame();
    game.gameScreen(numberOfCardsPlayed);
});
$('#congrats-switch-level-button').on('click', () => {
    game.resetGame();
    game.levelSelection();
});
$('#congrats-exit-button').on('click', () => {
    game.resetGame();
    game.initGame();
});

$(game.initGame);

