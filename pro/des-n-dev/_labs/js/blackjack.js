/*
|-------------------------------------------------------------------------------
| BLACKJACK GAME v1.0
|-------------------------------------------------------------------------------
|
| Author: Justin Thomsen
| Updated: 05/31/2012 5:20PM
|
| This game is a text-based player vs. dealer blackjack game.
|
| TABLE RULES:
| Dealer hits on soft 17, stays on hard 17 and higher.
| Blackjack pays 3:2. Insurance pays 2:1.
| The default table minimum and maximum are 5 and 500 chips.
| Player may double down on any 2 starting cards, receiving 1 more card alone.
| Doubling down on blackjack is prohibited.
| Player may split a hand once.
| Player may double after splitting.
| Player may hit on split aces.
| Game ends if player reaches 0 chips.
| Shoe (default size of 2 decks) reshuffled at 20% capacity.
|
| VERSION HISTORY
| v1.0 (05/31/2012)
| New Features:
| - Splitting the player hand once is now supported
| Code Adjustments:
| …
| Planned adjustments (Planned implementation version):
| …
|
*/

/*
|-------------------------------------------------------------------------------
| Game constructor
|-------------------------------------------------------------------------------
*/
function Game() {

    // Initialize the dealer and the player, sets playing variable to be true
    var user = new Player();
    var dealer = new Dealer();
    var playing = true;

    this.getUserBalance = function() {
        return user.getPlayerChips();
    };

    this.getPlaying = function() {
        return playing;
    };

    // Initializes each hand with 2 cards dealt from the front of the shoe
    this.newGame = function() {
        user.newHand();
        dealer.newHand();
        user.placeBet();
        user.hit(0);
        dealer.hit();
        user.hit(0);
        dealer.hit();
    };

    /**
    * This function checks to see if there is a blackjack and also offers
    * insurance against a dealer blackjack if the dealer's displayed card is
    * an Ace. If either the player or the dealer has an ace, returns a true
    * value to tell main program that a blackjack has occurred so the rest of
    * the action for the hand can be skipped.
    */
    this.checkBlackjack = function() {
        var blackjack = false; // TODO: comment this variable
        var buyInsurance = false; // --||--
        var userSum = user.sumPlayerHand(0); // --||--
        var dealerSum = dealer.sumDealerHand(); // --||--
        var message = ''; // --||--
        message +=  user.printPlayerHand(0) + '\n\n' +
                    dealer.printDealerHand();

        /**
        * Offer insurance to the player if dealer shows an Ace in the second
        * card spot of the dealer hand array of cards
        */
        if (dealer.getOneDealerCardValue() === 11) {
            buyInsurance = confirm(user.printPlayerHand(0) + '\n\n' +
                'Dealer hand:\n' +
                '[Hidden]\n ' +
                dealer.printOneDealerCard() + '\n\n' +
                'Would you like to buy insurance?\n\n' +
                '(Chip count: ' + (user.getPlayerChips() - user.getBet()) + ')');
            if (buyInsurance === true) {
                user.placeInsuranceBet();
            }
        }

        // If both user and dealer have blackjack...
        if (userSum === 21 && dealerSum === 21) {

            // Insurance bet wins a payoff of 2:1
            if (buyInsurance === true) {
                alert(message + 'You both have a blackjack! Your insurance wins ' + user.getInsuranceBet() +  ' chips and your blackjack pushes with the dealer.');
                user.playerInsuranceWin(user.getInsuranceBet());
            }

            // Main bet pushes
            else {
                alert(message + 'You both have a blackjack! You push with the dealer.');
            }
            blackjack = true;
        }

        // If only the user has blackjack...
        else if (userSum === 21) {

            // Insurance bet loses
            if (buyInsurance === true) {
                alert(message + 'You have a blackjack and the dealer does not. Your insurance loses ' + user.getInsuranceBet() + ' chips and your blackjack wins ' + (user.getBet() * 1.5) + ' chips.');
                user.playerInsuranceLoss(user.getInsuranceBet());
                user.playerBlackjackWin(Number(user.getBet()));
            }

            // Main bet wins a payoff of 3:2
            else {
                alert(message + 'You have a blackjack! You win ' +  (user.getBet() * 1.5) + ' chips.');
                user.playerBlackjackWin(Number(user.getBet()));
            }
            blackjack = true;
        }

        // If only the dealer has a blackjack
        else if (dealerSum === 21) {

            // Insurance bet wins a payoff of 2:1
            if (buyInsurance === true) {
                alert(message + 'The dealer has a blackjack! Your insurance wins ' + (user.getInsuranceBet() * 2) + ' chips and your main bet loses ' + user.getBet() + ' chips.');
                user.playerInsuranceWin(user.getInsuranceBet());
                user.playerLose(Number(user.getBet()));
            }

            // Main bet loses
            else {
                alert(message + 'The dealer has a blackjack! You lose ' + user.getBet() + ' chips.');
            }
            blackjack = true;
        }

        // If neither has blackjack and user bought insurance, lose that bet
        else if (buyInsurance === true && dealerSum !== 21) {
            alert('The dealer does not have a blackjack. You lose your insurance bet.');
            user.playerInsuranceLoss(user.getInsuranceBet());
        }
        return blackjack;
    };

    //Player's turn
    this.userAction = function() {
        var handsToPlay = 1,
            dealtCards = 2,
            splitHands = 0,
            bustValues = [],
            currentHand = 0,

            error = 'Invalid move.';

        /**
        * This function allows the user to choose between two moves: hit and
        * stay. This function stands alone in the action loop when the rules
        * do not permit the user to double or split and it is also nested
        * inside the threeOptions function for doubling (which is nested in
        * the fourOptions function for splitting). Alerts user if an
        * acceptable input is not received.
        */
        var twoOptions = function(currentHand) {
            if (action === "hit") {
                user.hit(currentHand);
                dealtCards++;
            } else if (action === "stay") {

                /**
                * This incrementer breaks out of the loop, even though the
                * actual number of dealt cards does not change. This variable is
                * not used in the future, so incrementing here does not affect
                * anything else in the program.
                */
                dealtCards++;
                hitting = false;
                bustValues.push(false);
                handsToPlay--;
            }
            else {
                alert(error);
            }
        };

        /**
        * This function allows the user to choose between doubling down,
        * hitting, or staying (contained in the call to twoOptions). This
        * function is also nested inside the fourOptions function for
        * splitting.
        */
        var threeOptions = function(currentHand) {
            if (action === "double down" || action === "double") {
                user.double(currentHand);
                dealtCards++;

                // Doubling stops hitting, ending the user's action on the hand
                hitting = false;
                bustValues.push(false);
                handsToPlay--;
            }
            else {
                twoOptions(currentHand);
            }
        };

        /**
        * This function allows the user to choose between splitting, doubling
        * down, hitting, or staying (contained in the call to threeOptions).
        */
        var fourOptions = function(splitHands) {
            if (action === "split") {
                user.split(splitHands);
                user.hit(currentHand);
                handsToPlay++;
                dealtCards++;
            }
            else {
                threeOptions(currentHand);
            }
        };

        //Main user action loop
        while(handsToPlay > 0) {
            // Two boolean variables to convey hitting and bust status of hand
            var hitting = true;
            // 7 placeholder variables for conditions used in inner loop
            var a, b, c, d, e, f;
            // Initialize action and message as empty strings to be filled
            var action = '';  // TODO: comment this variable
            var message = ''; // --||--
            var chipCount = ''; // --||--
            var hitOrStay = ''; // --||--
            var hitStayOrDouble = ''; // --||--
            var hitStayDoubleOrSplit = ''; // --||--
            var bet = user.getBet(); // --||--

            // Continue hitting until hand busts or player stays
            while(hitting) {
                chipCount = '(Chip count: ' + (user.getPlayerChips() - (bet * (splitHands + 1))) + ')';
                hitOrStay = 'Would you like to hit or stay?' + chipCount;
                hitStayOrDouble = 'Would you like to hit, ' + 'double down, or stay?' + chipCount;
                hitStayDoubleOrSplit = 'Would you like to hit, ' + 'double down, split, or stay?' + chipCount;
                message = user.printPlayerHand(currentHand) + '              (' + user.sumPlayerHand(currentHand) + ')\n\n' +
                    'Dealer hand:\n' +
                    '[Hidden]\n' +
                    dealer.printOneDealerCard() + "\n              (" +
                    dealer.getOneDealerCardValue() + ")";
                dealtCards = user.getPlayerHandLength(currentHand);

                // Use these variables in if/else conditions for readability:
                a = user.sumPlayerHand(currentHand) > 21 ? true : false; // is true if player will bust
                b = user.sumPlayerHand(currentHand) === 21 ? true : false; // is true if player has 21
                c = user.getPlayersCardValue(currentHand,0) ===
                        user.getPlayersCardValue(currentHand,1) ? true : false; // is true if player has two initial cards of the same
                d = user.getPlayerChips() >= (user.getBet() * 2) ? true : false; // is true if player can cover a double or a split
                e = dealtCards === 2 ? true : false; // is true if player has only two cards in hand
                f = splitHands < 1 ? true : false; // is true if player has not split

                // If player's score goes over 21...
                if (a) {
                    hitting = false;
                    handsToPlay--;
                    bustValues.push(true);
                    alert('You busted!');
                }

                // If player's score hits 21...
                else if (b) {
                    hitting = false;
                    handsToPlay--;
                    bustValues.push(false);
                }

                // If a player has 2 of the same cards and has not split
                else if (c && d && e && f) {
                    while(dealtCards === 2) {
                        action = prompt(message + hitStayDoubleOrSplit);
                        action.toLowerCase();
                        fourOptions(splitHands);
                        splitHands++;
                    }
                    // Reduces dealtCards back to 2 since one has been split off
                    dealtCards--;
                }

                // If player has only 2 cards and cannot split
                else if (d && e) {
                    while(dealtCards === 2) {
                        action = prompt(message + hitStayOrDouble);
                        action.toLowerCase();
                        threeOptions(currentHand);
                    }
                }

                else {
                    action = prompt(message + hitOrStay);
                    action.toLowerCase();
                    twoOptions(currentHand);
                }
            }
            currentHand++;
        }
        return bustValues; // Return whether or not user busted
    };

    /**
    * Function for the dealer's turn. Dealer must hit on soft 17 or lower (hand
    * and soft aces are treated in the sumDealerHand() function)
    */
    this.dealerAction = function() {
        while(true) {
            if (dealer.sumDealerHand() < 17) {
                dealer.hit();
            }
            if (dealer.sumDealerHand() >= 17) {
                break;
            }
        }
    };

    /**
    * Function to determine and display the winner of each hand, as well as
    * to adjust the chips held by the player according to the wager and
    * outcome. Blackjacks are not counted here since the checkBlackjack()
    * function ended the hand, displayed those results, and adjusted the
    * chips.
    */
    this.evaluateOutcome = function() {
        for(var i = 0; i < user.getNumberOfHands(); i++) {
            var userScore = user.sumPlayerHand(i);
            var dealerScore = dealer.sumDealerHand();
            var summary = '';
            summary += user.printPlayerHand(i) + '\n\n' +
                    dealer.printDealerHand() + "\n\n" +
                    'You scored a ' + userScore + ' and the dealer scored a ' + dealerScore + '.';

            // If user busted...
            if (userScore > 21) {
                alert(summary + 'You busted! You lose ' + user.getBet() + ' chips.');
                user.playerLose(Number(user.getBet()));
            }

            // If dealer busted...
            else if (dealerScore > 21) {
                alert(summary + 'Dealer busted! You win ' + user.getBet() + ' chips.');
                user.playerWin(Number(user.getBet()));
            }

            // If user's hand beats dealer's hand...
            else if (userScore > dealerScore) {
                alert(summary + 'You win ' + user.getBet() + ' chips.');
                user.playerWin(Number(user.getBet()));
            }

            // If dealer's hand beats user's hand...
            else if (userScore < dealerScore) {
                alert(summary + 'You lose ' + user.getBet() + ' chips.');
                user.playerLose(Number(user.getBet()));
            }

            // If user's hand is equal to dealer's hand...
            else if (userScore === dealerScore) {
                alert(summary + 'You pushed with the dealer.');
            }
        }
            // Offer to keep playing unless chipCount is below the table minimum
            if (Number(user.getPlayerChips()) < 5) {
            alert('You do not have enough chips to continue playing. Goodbye!');
            playing = false;
        }
        else {
            playing = confirm('You now have ' + user.getPlayerChips() + ' chips. Would you like to play again?');
        }
    };
}

/*
|-------------------------------------------------------------------------------
| Dealer constructor
|-------------------------------------------------------------------------------
*/
function Dealer() {
    var dealerHand = new Hand();

    // Add the next card in the shoe to the dealer's hand
    this.hit = function () {
        var dealtCard = [gameShoe.dealACard()];
        dealerHand.addCard(dealtCard[0].getNumber(), dealtCard[0].getSuit());
    };

    this.printDealerHand = function() {
        // Argument makes printHand function refer to dealer
        return dealerHand.printHand('Dealer\'s');
    };

    this.getDealerHandLength = function()  {
        return dealerHand.getHandLength();
    };

    this.sumDealerHand = function() {
        return dealerHand.sumHandOfDealer();
    };

    this.printOneDealerCard = function() {
        return dealerHand.showDealerCard();
    };

    this.getOneDealerCardValue = function() {
        return dealerHand.getCardValue(1);
    };

    this.newHand = function () {
        dealerHand.clearHand();
    };
}

/*
|-------------------------------------------------------------------------------
| Player constructor
|-------------------------------------------------------------------------------
*/
function Player() {

    /**
    * Starts a new player main hand, initialized as the first element
    * in an array to allow for hands to be added via splitting.
    */

    var playerHand = [new Hand()];
    // Initializes amount of chips player has to 100 chips
    var playerChips = new ChipStack(100);
    var bet = 0;
    var insuranceBet = 0;
    var handCount = 1;

    /**
    * The handIndex argument being passed in methods below refers to which
    * hand in the player's array is being acted on at the time
    */
    this.printPlayerHand = function(handIndex) {
        // Argument makes printHand function refer to player
        return playerHand[handIndex].printHand('Your');
    };

    this.sumPlayerHand = function(handIndex) {
        return playerHand[handIndex].sumHandOfPlayer();
    };

    this.clearPlayerHand = function() {
        playerHand.splice(0, playerHand.length);
        playerHand[0] = new Hand();
    };

    this.getPlayerChips = function() {
        return playerChips.getChips();
    };

    this.getBet = function() {
        return bet;
    };

    this.getInsuranceBet = function() {
        return insuranceBet;
    };

    this.playerWin = function(wager) {
        playerChips.win(Number(wager));
    };

    this.playerLose = function(wager) {
        playerChips.lose(Number(wager));
    };

    this.playerBlackjackWin = function(wager) {
        playerChips.blackjackWin(Number(wager));
    };

    this.playerInsuranceWin = function(wager) {
        playerChips.insuranceWin(Number(wager));
    };

    this.playerInsuranceLoss = function(wager) {
        playerChips.insuranceLoss(Number(wager));
    };

    this.getNumberOfHands = function() {
        return playerHand.length;
    };

    // Check how many cards are in a hand in the player's array
    this.getPlayerHandLength = function(handIndex) {
        return playerHand[handIndex].getHandLength();
    };

    // Get value of a particular card in a particular hand in the player's array
    this.getPlayersCardValue = function(handIndex, cardIndex) {
        return playerHand[handIndex].getCardValue(cardIndex);
    };

    /**
    * Function to allow user to place a bet. Prevents bets that are above or
    * below the table maximum or minimum, and those that are above the player's
    * chip count.
    */
    this.placeBet = function() {
        currentChips = playerChips.getChips();
        var betMessage = 'The table minimum is 5 chips. The table maximum ' + 'is 500 chips. You have ' + currentChips + ' chips.\n\n' +
            'Please place your next bet.';
        var lowChipsError = 'You don\'t have enough chips to make that bet.\n\n' +
            betMessage;
        var lowBetError = 'That bet is too low.\n\n' + betMessage;
        var highBetError = 'That bet is too high.\n\n' + betMessage;
        var nanError = 'Please enter your bet as a numeric value.\n\n' +
            betMessage;

        // Get initial bet value
        bet = prompt(betMessage);

        // Check for invalid bets
        while(bet < 5 || bet > 500 || bet > currentChips || isNaN(bet) === true) {
            // If bet is below the minimum...
            if (bet < 5) {
                bet = prompt(lowBetError);
            }
            // If bet is above the maximum...
            if (bet > 500) {
                bet = prompt(highBetError);
            }
            // If bet is greater than the number of chips the player has...
            if (bet > currentChips) {
                bet = prompt(lowChipsError);
            }
            // If bet is not a number...
            if (isNaN(bet)) {
                bet = prompt(nanError);
            }
        }
    };

    /**
    * Function to allow user to place an insurance bet. Prevents bets that are
    * above or below the insurance requirements, and those that are above the
    * player's chip count.
    */
    this.placeInsuranceBet = function() {
        currentChips = playerChips.getChips();
        var insuranceMessage = 'You may bet up to half your main bet (' + (bet / 2) + ' chips) on insurance. You have ' + currentChips + ' chips. Please enter your insurance bet.';
        var lowChipsError = 'You don\'t have enough chips to make that bet.\n\n' +
            insuranceMessage;
        var lowBetError = 'That bet is too low.\n\n' +
            insuranceMessage;
        var highBetError = 'That bet is too high.\n\n' +
            insuranceMessage;
        var nanError = 'Please enter your bet as a numeric value.\n\n' +
            insuranceMessage;

        // Get initial bet value
        insuranceBet = prompt(insuranceMessage);

        // Check for invalid bets
        while(insuranceBet > currentChips || insuranceBet > (bet / 2) || insuranceBet <= 0 || isNaN(insuranceBet)) {
            // If bet is greater than the number of chips the player has...
            if (insuranceBet > currentChips) {
                insuranceBet = prompt(lowChipsError);
            }
            // If insurance bet is more than half the main bet...
            if (insuranceBet > (bet / 2)) {
                insuranceBet = prompt(highBetError);
            }
            // If insurance bet is less than or equal to zero...
            if (insuranceBet <= 0) {
                insuranceBet = prompt(lowBetError);
            }
            // If insurance bet is not a number...
            if (isNaN(insuranceBet)) {
                insuranceBet = prompt(nanError);
            }
        }
    };

    // Reset the bet values, count of hands, and clears the playerHand array
    this.newHand = function () {
        bet = 0;
        insuranceBet = 0;
        handCount = 1;
        this.clearPlayerHand();
    };

    // Add the next card in the shoe to the specified handIndex
    this.hit = function(handIndex) {
        var dealtCard = [gameShoe.dealACard()];
        playerHand[handIndex].addCard
                (dealtCard[0].getNumber(), dealtCard[0].getSuit());
    };

    // Double the bet then hit
    this.double = function(handIndex) {
        bet *= 2;
        this.hit(handIndex);
    };

    /**
    * Splitting function: add a new hand to the player's array,
    * split the second card of the current hand of and add it as the
    * first card in the next hand in the player's array
    *
    * NB - May not be fully functioning yet.
    */
    this.split = function(splitHand) {
        playerHand.push(new Hand());
        var splitCard;
        splitCard = [playerHand[splitHand].splitHand()];
        playerHand[splitHand + 1].addCard(splitCard[0].getNumber(), splitCard[0].getSuit());
        this.hit(splitHand + 1);
    };
}

/*
|-------------------------------------------------------------------------------
| Shoe constructor, argument = number of decks in the shoe
|-------------------------------------------------------------------------------
*/
function Shoe(totalDecks) {

    // Intialize an empty shoe array
    var shoe = [];
    var numberOfDecks = totalDecks;

    this.getShoeLength = function() {
        return shoe.length;
    };

    this.getNumberOfDecks = function() {
        return numberOfDecks;
    };

    // Fill the deck with 13 cards of each suit in each deck
    this.shuffleShoe = function() {
        shoe.splice(0, shoe.length);
        for(var i = 0; i < numberOfDecks; i++) { // For every desk
            for(var j = 4; j <= 13; j++) { // …set 13 values
                for(var k = 1; k <= 4; k++) { // …of 4 suits
                    shoe.push(new Card(j, k));
                }
            }
        }


        /**
        * Randomly sorts the cards in the shoe, since they were added in order.
        * Using array.sort for shuffling isn't very effective though.
        * Causes and  alternatives:
        * http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/
        */
        shoe.sort(function() {return 0.5 - Math.random();});
    };

    /**
    * Remove the first card from the deck by copying its properties into a new
    * card and deleting the original in the shoe
    */
    this.dealACard = function() {
        var number = shoe[0].getNumber();
        var suit = shoe[0].getSuit();
        shoe.splice(0,1);
        var dealtCard = new Card(number, suit);
        return dealtCard;
    };
}

/*
|-------------------------------------------------------------------------------
| ChipStack constructor, argument = the number of starting chips
|-------------------------------------------------------------------------------
*/
function ChipStack(startingChips) {
   var chips = startingChips;

   this.getChips = function() {
       return chips;
   };

   // Win payoff rate of 1:1
   this.win = function(bet) {
       chips += bet * 1;
   };

   this.lose = function(bet) {
       chips -= bet * 1;
   };

   // Blackjack win payoff rate of 3:2
   this.blackjackWin = function(bet) {
       chips += bet * 1.5;
   };

   // Insurance bet payoff rate of 2:1
   this.insuranceWin = function(insuranceBet) {
      chips += insuranceBet * 2;
   };

   this.insuranceLoss = function(insuranceBet) {
      chips -= insuranceBet;
   };
}

/*
|-------------------------------------------------------------------------------
| Hand constructor
|-------------------------------------------------------------------------------
*/
function Hand() {
    var hand = [];

    this.addCard = function(n, s) {
        hand.push(new Card (n, s));
    };

    this.getCardValue = function(cardIndex) {
        return hand[cardIndex].getValue();
    };

    // Removes all cards from the hand
    this.clearHand = function() {
        hand.splice(0, hand.length);
    };

    this.getHandLength = function() {
        return hand.length;
    };

    /**
    * Remove a card from the current hand to be split into a new hand by
    * copying the card's properties into a new card, splicing out the copied
    * card from the hand array, and returning the new card
    */
    this.splitHand = function() {
        var number = hand[1].getNumber();
        var suit = hand[1].getSuit();
        hand.splice(1,1);
        var splitCard = new Card(number, suit);
        return splitCard;
    };

    // Takes one string argument used to display whose hand is being printed
    this.printHand = function(whoseHand) {
        var handString = '';
        handString += whoseHand + ' hand:';
        for(var i = 0; i < hand.length; i++) {
            handString += '\n        "' + hand[i].getName() + '"';
        }
        handString += '\n';
        return handString;
    };

    /**
    * Aces are counted as 11 (soft) until it would force a bust,
    * after that point, they are counted as 1
    */
    this.sumHandOfPlayer = function() {
        var sum = 0;
        var softAces = 0;

        // Runs through each card in the hand, adding to hand's value
        for(var i = 0; i < hand.length; i++) {
            if (hand[i].getValue() === 11) {
                // Add a soft ace to the tally if present
                softAces++;
            }
            sum += hand[i].getValue();

            /**
            * If the current card would force a bust and the hand has a soft
            * ace, count that ace as a 1 and decrement the soft aces.
            */
            if (sum > 21 && softAces > 0) {
                sum -= 10;
                softAces--;
            }
        }
        return sum;
    };

    // Same as above function except soft dealer 17 is counted as a 7
    this.sumHandOfDealer = function() {
        var sum = 0;
        var softAces = 0;
        for(var i = 0; i < hand.length; i++) {
            if (hand[i].getValue() === 11) {
                softAces++;
            }
            sum += hand[i].getValue();
            if ((sum === 17 || sum > 21) && softAces > 0) {
                sum -= 10;
                softAces--;
            }
        }
        return sum;
    };

    // Dealer's second card is revealed at start of hand
    this.showDealerCard = function() {
        return '"' + hand[1].getName() + '"';
    };
}

/*
|-------------------------------------------------------------------------------
| Card constructor
|-------------------------------------------------------------------------------
*/
function Card(n, s) {
    var number = n;
    var suit = s;

    this.getNumber = function()  {
        return number;
    };
    this.getSuit = function() {
        return suit;
    };
    this.getValue = function() {
        // Assumes all aces always 11, adjusted in sum() function of Hand class
        if (number === 1) {
            return 11;
        }
        else if (number > 10) {
            return 10;
        }
        else return number;
    };
    this.getName = function() {
        var name;
        switch(number) {
        case 1:
            name = 'Ace';
            break;
        case 11:
            name = 'Jack';
            break;
        case 12:
            name = 'Queen';
            break;
        case 13:
            name = 'King';
            break;
        default:
            name = number;
        }
        switch(suit) {
        case 1:
            name += ' of Spades';
            break;
        case 2:
            name += ' of Diamonds';
            break;
        case 3:
            name += ' of Clubs';
            break;
        case 4:
            name += ' of Hearts';
            break;
        }
        return name;
    };
}

/*
|-------------------------------------------------------------------------------
|
| MAIN PROGRAM
| ************
|-------------------------------------------------------------------------------
*/

// Initializes the shoe with two decks and shuffles cards
var gameShoe = new Shoe(2);
var game = new Game();
gameShoe.shuffleShoe();

function playGame() {
    game.newGame();
    var blackjack = game.checkBlackjack();
    // Player only plays if there is no blackjack
    if (blackjack === false) {
        var bustArray = game.userAction();
        var bustCount = 0;
        var handCount = bustArray.length;
        for(var i = 0; i < bustArray.length; i++) {
            if (bustArray[i] === true) {
                bustCount++;
            }
        }
        // Dealer only plays if player has not busted all hands
        if (bustCount < handCount) {
                game.dealerAction();
            }
        game.evaluateOutcome();
    }
}

/* -----------------------------------------------------------------------------

Plays game until user quits or runs out of money, shuffles if the shoe falls
below 20% of full capacity. */

while(game.getPlaying() === true && game.getUserBalance() > 0) {
    if (gameShoe.getShoeLength() < (0.2 * (gameShoe.getNumberOfDecks() * 52))) {
                gameShoe.shuffleShoe();
        alert("New shuffle!");
    }
    playGame();
}

/*
|
| PRE- 1.0 VERSION HISTORY DOCUMENTATION
|
| v0.3.1 updates (05/24/2012)
| New Features:
| * Reorganized UI text display vertically for better readability
| * UI shows that dealer has been dealt 2 cards prior to action
|
| Fixed Bugs:
| * Dealer no longer hits after player busts
|
*/
