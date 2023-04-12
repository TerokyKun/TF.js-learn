const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

// Проверяем, поддерживает ли браузер использование веб-камеры.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

// Если поддерживается использование веб-камеры, добавляем слушатель событий на кнопку,
// чтобы вызвать функцию WenableCam, которую мы определим на следующем шаге.
if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() не поддерживается вашим браузером');
}

// Включаем просмотр видеопотока с веб-камеры и начинаем классификацию.
function enableCam(event) {
    // Продолжаем только если COCO-SSD закончил загрузку.
    if (!model) {
        return;
    }

    // Скрываем кнопку после её нажатия.
    event.target.classList.add('removed');

    // Параметры для получения видео потока с веб-камеры без аудио.
    const constraints = {
        video: true
    };

    // Активируем поток с веб-камеры.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
    });
}


// Притворяемся, что модель загрузилась, чтобы мы могли попробовать код с веб-камерой.
var model = true;
demosSection.classList.remove('invisible');
// Сохраняем полученную модель в глобальной области нашего приложения.
var model = undefined;

// Прежде чем мы сможем использовать класс COCO-SSD, мы должны подождать,
// пока он загрузится. Модели машинного обучения могут быть большими и занять
// некоторое время для получения всего необходимого для запуска.
// Примечание: cocoSsd - это внешний объект, загружаемый из нашего индексного html-файла,
// так что игнорируйте любые предупреждения в Glitch.
cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
    // Показываем раздел демонстрации теперь, когда модель готова к использованию.
    demosSection.classList.remove('invisible');
});

var children = [];

function predictWebcam() {
    // Начинаем классифицировать кадры в потоке.
    model.detect(video).then(function (predictions) {
        // Удаляем любое подсвечивание, которое мы сделали в предыдущем кадре.
        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i]);
        }
        children.splice(0);

        // Теперь давайте пройдемся по предсказаниям и нарисуем их на живом видео, если
        // они имеют высокую оценку уверенности.
        for (let n = 0; n < predictions.length; n++) {
            // Если мы уверены на 66% или более, что мы правильно классифицировали объект, рисуем его!
            if (predictions[n].score > 0.66) {
                const p = document.createElement('p');
                p.innerText = predictions[n].class + ' - с '
                    + Math.round(parseFloat(predictions[n].score) * 100)
                    + '% уверенностью.';
                p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                    + (predictions[n].bbox[1] - 10) + 'px; width: '
                    + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                    + predictions[n].bbox[1] + 'px; width: '
                    + predictions[n].bbox[2] + 'px; height: '
                    + predictions[n].bbox[3] + 'px;';

                liveView.appendChild(highlighter);
                liveView.appendChild(p);
                children.push(highlighter);
                children.push(p);
            }
        }

        // Вызываем эту функцию снова, чтобы продолжать делать предсказания, когда браузер готов.
        window.requestAnimationFrame(predictWebcam);
    });
}





