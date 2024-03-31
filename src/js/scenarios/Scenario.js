import Scene from "../canvas/Scene";
import { RotatingArc } from "../canvas/shapes/arcs";
import Debug from "../utils/Debug";

export default class Scenario extends Scene {
    constructor(id) {
        super(id);
        this.params = {
            baseLineWidth: 2,
            maxHourLineWidth: 20,
            maxMinuteSecondLineWidth: 10,
            colorHours: "#000000",
            colorMinutes: "#000000",
            colorSeconds: "#000000",
        };
        this.gradientCurrent = {
            position: 0,
            redIntensity: 50
        };
        this.gradientTarget = {
            ...this.gradientCurrent
        };
        this.initArcs();
    }

    initArcs() {
        const baseRadius = Math.min(this.width, this.height) / 4;
        const radiusIncrement = 30;
        this.hourArc = new RotatingArc(this.width / 2, this.height / 2, baseRadius, -Math.PI / 2, 0);
        this.minuteArc = new RotatingArc(this.width / 2, this.height / 2, baseRadius + radiusIncrement, -Math.PI / 2, 0);
        this.secondArc = new RotatingArc(this.width / 2, this.height / 2, baseRadius + 2 * radiusIncrement, -Math.PI / 2, 0);
        this.updateArcs(true);
    }

    update() {
        const currentTime = new Date();
        this.updateGradientTarget();
        this.gradientCurrent.position += (this.gradientTarget.position - this.gradientCurrent.position) * 0.05;
        this.gradientCurrent.redIntensity += (this.gradientTarget.redIntensity - this.gradientCurrent.redIntensity) * 0.05;
        this.updateArcs();
        this.adjustColorsAndLineWidth(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
        this.drawUpdate();
    }

    updateArcs(init = false) {
        const currentTime = new Date();
        const hours = currentTime.getHours() % 12;
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
        let hourAngle = -Math.PI / 2 + 2 * Math.PI * (hours / 12 || 1);
        let minuteAngle = -Math.PI / 2 + 2 * Math.PI * (minutes / 60 || 1);
        let secondAngle = -Math.PI / 2 + 2 * Math.PI * seconds / 60;
        if (init) {
            this.hourArc.endAngle = hourAngle;
            this.minuteArc.endAngle = minuteAngle;
            this.secondArc.endAngle = secondAngle;
        } else {
            this.hourArc.endAngle += (hourAngle - this.hourArc.endAngle) * 0.05;
            this.minuteArc.endAngle += (minuteAngle - this.minuteArc.endAngle) * 0.05;
            this.secondArc.endAngle += (secondAngle - this.secondArc.endAngle) * 0.05;
        }
    }

    adjustColorsAndLineWidth(hours, minutes, seconds) {
        let eveningFactor = hours >= 18 ? (hours - 18) / 6 : hours / 24;
        let hourLineWidth = this.params.baseLineWidth + (this.params.maxHourLineWidth - this.params.baseLineWidth) * eveningFactor;
        let minuteLineWidth = this.params.baseLineWidth + (hourLineWidth - this.params.baseLineWidth) / 2;
        let secondLineWidth = this.params.baseLineWidth + (minuteLineWidth - this.params.baseLineWidth) * (seconds / 60);
        this.params['line-width'] = {
            hours: hourLineWidth,
            minutes: minuteLineWidth,
            seconds: secondLineWidth,
        };

        if (hours < 7) {
            this.params.colorHours = "#FFD700";
            this.params.colorMinutes = "#F0E68C";
            this.params.colorSeconds = "#FFFAF0";
        } else if (hours < 10) {
            this.params.colorHours = "#87CEEB";
            this.params.colorMinutes = "#ADD8E6";
            this.params.colorSeconds = "#B0E0E6";
        } else if (hours < 17) {
            this.params.colorHours = "#00BFFF";
            this.params.colorMinutes = "#1E90FF";
            this.params.colorSeconds = "#6495ED";
        } else if (hours < 20) {
            this.params.colorHours = "#FF8C00";
            this.params.colorMinutes = "#FFA07A";
            this.params.colorSeconds = "#FFDAB9";
        } else {
            this.params.colorHours = "#00008B";
            this.params.colorMinutes = "#0000CD";
            this.params.colorSeconds = "#191970";
        }
    }

    drawTimeMarks() {
        const { context, width, height } = this;
        const centerX = width / 2;
        const centerY = height / 2;
        const hourRadius = Math.min(width, height) / 4; 
        const minuteRadius = hourRadius + 30; 
       
        // Dessin pour les heures
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * (2 * Math.PI) - Math.PI / 2;
            const x = centerX + hourRadius * Math.cos(angle);
            const y = centerY + hourRadius * Math.sin(angle);
            context.beginPath();
            context.arc(x, y, 5, 0, 2 * Math.PI); 
            context.fillStyle = '#FFD700'; 
            context.fill();
        }
    
        // Dessin pour les minutes (toutes les 15 minutes)
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * (2 * Math.PI) - Math.PI / 2;
            const x = centerX + minuteRadius * Math.cos(angle);
            const y = centerY + minuteRadius * Math.sin(angle);
            context.beginPath();
            context.arc(x, y, 3, 0, 2 * Math.PI); 
            context.fillStyle = '#87CEEB';
            context.fill();
        }

    }
    
    drawUpdate() {
        this.clear();
        this.updateBackground();
    
        this.context.lineCap = 'round';
    
        this.context.lineWidth = this.params['line-width'].hours;
        this.context.strokeStyle = this.params.colorHours;
        this.hourArc.draw(this.context);
    
        this.context.lineWidth = this.params['line-width'].minutes;
        this.context.strokeStyle = this.params.colorMinutes;
        this.minuteArc.draw(this.context);
    
        this.context.lineWidth = this.params['line-width'].seconds;
        this.context.strokeStyle = this.params.colorSeconds;
        this.secondArc.draw(this.context);
    
        this.drawTimeMarks();
    }
    
    updateBackground() {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        let gradientStartColor, gradientEndColor;
        if (hours < 7) {
            gradientStartColor = "#000033";
            gradientEndColor = "#2a2a72";
        } else if (hours < 10) {
            gradientStartColor = "#0072BB";
            gradientEndColor = "#FFD700";
        } else if (hours < 17) {
            gradientStartColor = "#87CEEB";
            gradientEndColor = "#00BFFF";
        } else if (hours < 20) {
            gradientStartColor = "#FF8C00";
            gradientEndColor = "#FFD700";
        } else {
            gradientStartColor = "#000033";
            gradientEndColor = "#000033";
        }
        const gradient = this.context.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, gradientStartColor);
        gradient.addColorStop(1, gradientEndColor);
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    updateGradientTarget() {
        const currentTime = new Date();
        const seconds = currentTime.getSeconds();
        const minutes = currentTime.getMinutes();
        const hours = currentTime.getHours();
        this.gradientTarget.position = Math.sin(seconds * Math.PI / 30) * this.width;
        this.gradientTarget.redIntensity = 50 + (hours % 12) * 10 + minutes;
    }

    resize() {
        super.resize();
        this.initArcs(true);
    }
    
}
