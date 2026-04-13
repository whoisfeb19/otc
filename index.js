
        function switchTab(e, index, id) {
            document.getElementById('indicator').style.transform = `translateX(${index * 100}%)`;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            document.querySelectorAll('.content-box').forEach(c => c.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        const cards = document.querySelectorAll('.link-item');
        document.addEventListener('mousemove', e => {
            const glow = document.getElementById('cursor-glow');
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);

                if (e.target.closest('.link-item') === card) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    card.style.transform = `perspective(1000px) rotateX(${(y-centerY)/12}deg) rotateY(${(centerX-x)/12}deg) scale(1.05) translateY(-5px)`;
                }
            });
        });

        cards.forEach(card => {
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)`;
            });
        });
