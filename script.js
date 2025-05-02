const bird = document.querySelector('.bird');
const pipesContainer = document.querySelector('#pipes-container');
const scoreElement = document.getElementById('score');
const gameOverElement = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart-button');
const gameContainer = document.querySelector('.game-container');
let birdTop = 300;
let gravity = 0.1; // Yerçekimini daha da azalttık
let velocity = 0;
let maxVelocity = 4; // Maksimum düşme hızını sınırlıyoruz
let isJumping = false;
let gameStarted = false;
let gameOver = false;
let initialFloatAngle = 0;
let pipeSpeed = 2;
let pipeGap = 150; // Borular arasındaki boşluk
let minPipeHeight = 50; // Minimum boru yüksekliği
let pipeInterval = 1500; // Borular arası süreyi 2 saniyeye düşürdük
let score = 0;
let pipeIntervalId = null;

// Dokunmatik ve fare tıklaması için event listener'lar
gameContainer.addEventListener('touchstart', handleJump);
gameContainer.addEventListener('mousedown', handleJump);
document.addEventListener('keydown', handleJump);
restartButton.addEventListener('click', resetGame);

// Dokunmatik olayların varsayılan davranışını engelle
gameContainer.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

function handleJump(e) {
    // Space tuşu, dokunma veya tıklama için kontrol
    if ((e.type === 'keydown' && e.code === 'Space') || 
        e.type === 'touchstart' || 
        e.type === 'mousedown') {
        
        e.preventDefault(); // Varsayılan davranışı engelle
        
        if (!gameOver) {
            if (!gameStarted) {
                startGame(e);
            } else {
                jump();
            }
        }
    }
}

function resetGame() {
    // Tüm boruları temizle
    pipesContainer.innerHTML = '';
    
    // Değişkenleri sıfırla
    birdTop = 300;
    velocity = 0;
    score = 0;
    gameOver = false;
    gameStarted = false;
    
    // Skoru güncelle
    scoreElement.textContent = '0';
    
    // UI elementlerini gizle
    gameOverElement.style.display = 'none';
    restartButton.style.display = 'none';
    
    // Interval'i temizle
    if (pipeIntervalId) {
        clearInterval(pipeIntervalId);
        pipeIntervalId = null;
    }
    
    // Kuşu başlangıç pozisyonuna getir
    bird.style.top = birdTop + 'px';
    
    // Animasyonu yeniden başlat
    requestAnimationFrame(updateBirdPosition);
}

function jump() {
    velocity = -4; // Zıplama kuvvetini azalttık
    isJumping = true;
}

function checkCollision() {
    const birdRect = bird.getBoundingClientRect();
    const pipes = document.querySelectorAll('.pipe');
    
    for (let pipe of pipes) {
        const pipeRect = pipe.getBoundingClientRect();
        
        if (
            birdRect.left < pipeRect.right &&
            birdRect.right > pipeRect.left &&
            birdRect.top < pipeRect.bottom &&
            birdRect.bottom > pipeRect.top
        ) {
            return true; // Çarpışma var
        }
    }
    return false; // Çarpışma yok
}

function updateScore() {
    const birdRect = bird.getBoundingClientRect();
    const pipes = document.querySelectorAll('.pipe.top');
    
    pipes.forEach(pipe => {
        const pipeRect = pipe.getBoundingClientRect();
        if (!pipe.scored && pipeRect.right < birdRect.left) {
            score++;
            scoreElement.textContent = score;
            pipe.scored = true;
        }
    });
}

function endGame() {
    gameOver = true;
    gameStarted = false;
    
    // Oyun sonu UI'ı göster
    gameOverElement.style.display = 'block';
    restartButton.style.display = 'block';
    
    // Interval'i temizle
    if (pipeIntervalId) {
        clearInterval(pipeIntervalId);
        pipeIntervalId = null;
    }
}

function createPipe() {
    if (gameOver) return;
    
    // Rastgele yükseklik belirleme
    const availableHeight = 600 - pipeGap;
    const topHeight = Math.random() * (availableHeight - 2 * minPipeHeight) + minPipeHeight;
    const bottomHeight = availableHeight - topHeight;

    // Üst boru
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe top';
    topPipe.style.height = topHeight + 'px';
    topPipe.style.left = '800px'; // Ekranın sağından başla
    topPipe.scored = false;

    // Alt boru
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe bottom';
    bottomPipe.style.height = bottomHeight + 'px';
    bottomPipe.style.left = '800px';

    pipesContainer.appendChild(topPipe);
    pipesContainer.appendChild(bottomPipe);

    return { topPipe, bottomPipe };
}

function movePipes() {
    if (gameOver) return;
    
    const pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        const currentLeft = parseFloat(pipe.style.left);
        pipe.style.left = (currentLeft - pipeSpeed) + 'px';

        // Ekrandan çıkan boruları temizle
        if (currentLeft < -70) {
            pipe.remove();
        }
    });
}

function updateBirdPosition() {
    if (!gameStarted) {
        // Başlangıç animasyonu: yumuşak süzülme hareketi
        initialFloatAngle += 0.02;
        birdTop = 300 + Math.sin(initialFloatAngle) * 20;
        
        // İlk space tuşuna basıldığında oyun başlayacak
        document.addEventListener('keydown', startGame, { once: true });
    } else if (!gameOver) {
        velocity += gravity;
        // Düşme hızını sınırla
        if (velocity > maxVelocity) {
            velocity = maxVelocity;
        }
        birdTop += velocity;
        
        // Çarpışma kontrolü
        if (checkCollision()) {
            endGame();
            return;
        }
        
        // Skor güncelleme
        updateScore();
    }
    
    // Sınırları kontrol et
    if (birdTop < 0) {
        birdTop = 0;
        velocity = 0;
    }
    if (birdTop > 570) {
        birdTop = 570;
        velocity = 0;
        if (gameStarted) {
            endGame();
            return;
        }
    }
    
    bird.style.top = birdTop + 'px';
    
    if (gameStarted && !gameOver) {
        movePipes();
    }
    
    requestAnimationFrame(updateBirdPosition);
}

function startGame(e) {
    if (!gameOver) {
        gameStarted = true;
        jump();
        createPipe();
        pipeIntervalId = setInterval(() => {
            if (gameStarted && !gameOver) {
                createPipe();
            }
        }, pipeInterval);
    }
}

updateBirdPosition(); 