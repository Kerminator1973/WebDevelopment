# Web-графика

Для построение комплексных 2D графиков часто используется библиотека [D3.js](https://d3js.org/)

## 3D графика

Для построения 3D-сцен может быть использована библиотека [Three.js](https://threejs.org/)

Three.js позволяет описать 3D сцену. Например:

```js
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>3D Домик Three.js</title>
    <style>
        body { margin: 0; overflow: hidden; }
    </style>
</head>
<body>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

    <script>
        let scene, camera, renderer, controls;
        const HOUSE_COLOR = 0x8B4513; // Коричневый для дерева
        const ROOF_COLOR = 0xcc0000;  // Красный для крыши

        function init() {
            // --- A. Сцена ---
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0); // Светлый фон
            
            // --- B. Камера ---
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(10, 10, 15);

            // --- C. Рендерер (WebGL) ---
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // --- D. Освещение ---
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(10, 20, 10);
            scene.add(directionalLight);

            // --- E. Управление камерой ---
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;

            // 3. Создание Домика
            createHouse();

            // Обработчик изменения размера окна
            window.addEventListener('resize', onWindowResize, false);
        }

        function createHouse() {
            // 1. Пол (Земля)
            const groundGeometry = new THREE.PlaneGeometry(30, 30);
            const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x6B8E23 }); // Зеленый
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2; // Поворачиваем плоскость
            scene.add(ground);

            // 2. Тело Домика (куб)
            const bodyWidth = 5;
            const bodyHeight = 4;
            const bodyDepth = 5;
            const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: HOUSE_COLOR });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = bodyHeight / 2; // Центрируем по высоте
            scene.add(body);

            // 3. Крыша (пирамида)
            // Для простоты, создадим крышу как более широкий параллелепипед
            const roofWidth = 7;
            const roofDepth = 7;
            const roofHeight = 3;
            const roofGeometry = new THREE.BoxGeometry(roofWidth, roofHeight, roofDepth);
            const roofMaterial = new THREE.MeshLambertMaterial({ color: ROOF_COLOR });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            
            // Поднимаем крышу на высоту тела (4) и добавляем половину ее высоты (1.5)
            roof.position.y = bodyHeight + roofHeight / 2;
            scene.add(roof);
        }


        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // Обновляем контроллеры для плавности
            renderer.render(scene, camera);
        }

        // Запуск
        init();
        animate();

    </script>
</body>
</html>
```

**OrbitControls.js** — это вспомогательный контроллер (из примеров Three.js), который даёт пользователю возможность интерактивно управлять камерой в 3D‑сцене. Он работает совместно с Three.js, не заменяя его, а расширяя функционал.

**WebGL (Web Graphics Library)** — это API для рендеринга интерактивной 2D‑ и 3D‑графики прямо в браузере, без плагинов и отдельного ПО. Он позволяет использовать мощность видеокарты (GPU) через JavaScript, чтобы рисовать сложные сцены с высокой производительностью.

WebGL базируется на стандарте OpenGL ES (Embedded System) — версии OpenGL для мобильных и встраиваемых систем. WebGL 1.0 — на OpenGL ES 2.0, WebGL 2.0 — на OpenGL ES 3.0.

Работает внутри элемента `<canvas>` в HTML и управляется через JavaScript.

Вся отрисовка происходит через небольшие программы (шейдеры) на языке GLSL (OpenGL Shading Language). Есть два основных типа:

- Вершинный шейдер — обрабатывает координаты вершин, задаёт положение объектов в пространстве, проекции, трансформации
- Фрагментный шейдер — определяет цвет каждого пикселя, текстуры, освещение, эффекты
