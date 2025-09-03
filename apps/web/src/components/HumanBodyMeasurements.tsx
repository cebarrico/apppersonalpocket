
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2 } from 'lucide-react';

interface BodyMeasurement {
  part: string;
  value: number;
  unit: string;
  date: string;
}

const mockMeasurements: Record<string, BodyMeasurement> = {
  chest: { part: 'Peitoral', value: 100, unit: 'cm', date: '2024-01-15' },
  waist: { part: 'Cintura', value: 77, unit: 'cm', date: '2024-01-15' },
  arms: { part: 'Braços', value: 39, unit: 'cm', date: '2024-01-15' },
  legs: { part: 'Coxas', value: 58, unit: 'cm', date: '2024-01-15' },
  shoulders: { part: 'Ombros', value: 115, unit: 'cm', date: '2024-01-15' },
  hips: { part: 'Quadril', value: 95, unit: 'cm', date: '2024-01-15' },
};

export const HumanBodyMeasurements = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [measurements, setMeasurements] = useState(mockMeasurements);

  const handlePartClick = (part: string) => {
    setSelectedPart(part);
    setIsDialogOpen(true);
  };

  const handleSave = (part: string, value: number) => {
    setMeasurements(prev => ({
      ...prev,
      [part]: {
        ...prev[part],
        value,
        date: new Date().toISOString().split('T')[0]
      }
    }));
    setIsDialogOpen(false);
    setSelectedPart(null);
  };

  return (
    <Card className="bg-gradient-to-br from-light-gray to-light-gray/80 border-light-gray aqua-glow">
      <CardHeader>
        <CardTitle className="text-ice-white flex items-center">
          <Edit2 className="h-5 w-5 mr-2 text-aqua" />
          Medidas Corporais
        </CardTitle>
        <p className="text-light-gray-text text-sm">Clique nas partes do corpo para adicionar/editar medidas</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Human Body SVG */}
          <div className="relative">
            <svg
              width="200"
              height="400"
              viewBox="0 0 200 400"
              className="body-svg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(61, 217, 179, 0.1))' }}
            >
              {/* Body outline */}
              <path
                d="M100 40 Q85 45 85 65 L85 85 Q80 90 75 110 L75 180 Q75 190 85 200 L85 280 Q85 290 75 300 L75 350 Q75 360 85 365 L95 365 L95 390 L105 390 L105 365 L115 365 Q125 360 125 350 L125 300 Q115 290 115 280 L115 200 Q125 190 125 180 L125 110 Q120 90 115 85 L115 65 Q115 45 100 40 Z"
                fill="rgba(61, 217, 179, 0.1)"
                stroke="rgba(61, 217, 179, 0.5)"
                strokeWidth="2"
                className="body-outline"
              />

              {/* Head */}
              <circle
                cx="100"
                cy="25"
                r="20"
                fill="rgba(61, 217, 179, 0.1)"
                stroke="rgba(61, 217, 179, 0.5)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/30 transition-all duration-300"
                onClick={() => handlePartClick('head')}
              />

              {/* Shoulders */}
              <ellipse
                cx="100"
                cy="55"
                rx="25"
                ry="8"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('shoulders')}
              />

              {/* Chest */}
              <ellipse
                cx="100"
                cy="85"
                rx="20"
                ry="15"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('chest')}
              />

              {/* Arms */}
              <ellipse
                cx="65"
                cy="100"
                rx="8"
                ry="25"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('arms')}
              />
              <ellipse
                cx="135"
                cy="100"
                rx="8"
                ry="25"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('arms')}
              />

              {/* Waist */}
              <ellipse
                cx="100"
                cy="140"
                rx="15"
                ry="10"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('waist')}
              />

              {/* Hips */}
              <ellipse
                cx="100"
                cy="170"
                rx="18"
                ry="12"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('hips')}
              />

              {/* Legs */}
              <ellipse
                cx="90"
                cy="230"
                rx="10"
                ry="30"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('legs')}
              />
              <ellipse
                cx="110"
                cy="230"
                rx="10"
                ry="30"
                fill="rgba(61, 217, 179, 0.2)"
                stroke="rgba(61, 217, 179, 0.6)"
                strokeWidth="2"
                className="cursor-pointer hover:fill-aqua/40 transition-all duration-300"
                onClick={() => handlePartClick('legs')}
              />

              {/* Measurement indicators */}
              {Object.entries(measurements).map(([key, measurement]) => {
                const positions: Record<string, { x: number; y: number }> = {
                  chest: { x: 120, y: 85 },
                  waist: { x: 120, y: 140 },
                  arms: { x: 150, y: 100 },
                  legs: { x: 130, y: 230 },
                  shoulders: { x: 130, y: 55 },
                  hips: { x: 125, y: 170 },
                };

                const pos = positions[key];
                if (!pos) return null;

                return (
                  <g key={key}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="3"
                      fill="#3DD9B3"
                      className="animate-pulse"
                    />
                    <text
                      x={pos.x + 8}
                      y={pos.y + 2}
                      fill="#3DD9B3"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {measurement.value}{measurement.unit}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Measurements Summary */}
          <div className="space-y-3 w-full lg:w-auto">
            {Object.entries(measurements).map(([key, measurement]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-medium-blue-gray to-medium-blue-gray/80 rounded-xl hover:from-medium-blue-gray/80 hover:to-medium-blue-gray/60 transition-all duration-300 cursor-pointer hover-scale"
                onClick={() => handlePartClick(key)}
              >
                <div>
                  <p className="font-semibold text-ice-white">{measurement.part}</p>
                  <p className="text-light-gray-text text-sm">
                    Última medição: {new Date(measurement.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-aqua">
                    {measurement.value}
                    <span className="text-sm text-light-gray-text ml-1">{measurement.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Measurement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-light-gray border-light-gray">
          <DialogHeader>
            <DialogTitle className="text-ice-white">
              {selectedPart ? `Medida - ${measurements[selectedPart]?.part || selectedPart}` : 'Medida'}
            </DialogTitle>
          </DialogHeader>
          {selectedPart && (
            <MeasurementForm
              measurement={measurements[selectedPart]}
              onSave={(value) => handleSave(selectedPart, value)}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface MeasurementFormProps {
  measurement: BodyMeasurement;
  onSave: (value: number) => void;
  onCancel: () => void;
}

const MeasurementForm = ({ measurement, onSave, onCancel }: MeasurementFormProps) => {
  const [value, setValue] = useState(measurement.value.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onSave(numValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="measurement" className="text-ice-white">
          {measurement.part} ({measurement.unit})
        </Label>
        <Input
          id="measurement"
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-medium-blue-gray border-light-gray text-ice-white mt-2"
          placeholder={`Medida em ${measurement.unit}`}
          autoFocus
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-light-gray-text hover:text-ice-white hover:bg-medium-blue-gray"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-aqua text-dark-teal hover:bg-aqua/80"
        >
          <Plus className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
    </form>
  );
};
