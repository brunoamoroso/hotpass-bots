export default function CycleFormat(duration, cycle){
    if(duration === 1 || duration === "1"){
        switch (cycle) {
            case "weekly":
                return "Semana";
                break;
            
            case "monthly":
                return "Mês";
                break;
        }
    }else{
        switch (cycle) {
            case "weekly":
                return "Semanas";
                break;
            
            case "monthly":
                return "Meses";
                break;
        }
    }
}