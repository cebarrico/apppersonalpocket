import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Weight, Ruler, Activity } from 'lucide-react';
import { useState } from 'react';
import { HumanBodyMeasurements } from '@/components/HumanBodyMeasurements';

const mockWeightData = [
  { month: 'Jan', weight: 75 },
  { month: 'Fev', weight: 73 },
  { month: 'Mar', weight: 71 },
  { month: 'Abr', weight: 70 },
  { month: 'Mai', weight: 69 },
  { month: 'Jun', weight: 68 },
];

const mockMeasurementData = [
  { month: 'Jan', chest: 95, waist: 85, arm: 35 },
  { month: 'Fev', chest: 96, waist: 83, arm: 36 },
  { month: 'Mar', chest: 97, waist: 81, arm: 37 },
  { month: 'Abr', chest: 98, waist: 80, arm: 37.5 },
  { month: 'Mai', chest: 99, waist: 78, arm: 38 },
  { month: 'Jun', chest: 100, waist: 77, arm: 39 },
];

const mockStudents = [
  { id: '1', name: 'Maria Santos' },
  { id: '2', name: 'João Silva' },
  { id: '3', name: 'Ana Costa' },
  { id: '4', name: 'Pedro Oliveira' },
];

export const EvolutionCharts = () => {
  const [selectedStudent, setSelectedStudent] = useState('1');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-ice-white mb-2 bg-gradient-to-r from-ice-white to-aqua bg-clip-text text-transparent">
            Evolução
          </h1>
          <p className="text-light-gray-text text-lg">Acompanhe o progresso dos seus alunos</p>
        </div>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-48 bg-medium-blue-gray border-light-gray text-ice-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-medium-blue-gray border-light-gray">
            {mockStudents.map((student) => (
              <SelectItem 
                key={student.id} 
                value={student.id}
                className="text-ice-white hover:bg-light-gray"
              >
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-aqua/10 to-aqua/5 border-aqua/20 hover:border-aqua/40 transition-all duration-300 aqua-glow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-aqua/20 p-3 rounded-xl">
                <Weight className="h-6 w-6 text-aqua" />
              </div>
              <div>
                <p className="text-light-gray-text text-sm">Peso atual</p>
                <p className="text-3xl font-bold text-ice-white">68kg</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  -7kg desde o início
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-aqua/10 to-aqua/5 border-aqua/20 hover:border-aqua/40 transition-all duration-300 aqua-glow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-aqua/20 p-3 rounded-xl">
                <Ruler className="h-6 w-6 text-aqua" />
              </div>
              <div>
                <p className="text-light-gray-text text-sm">Circunferência</p>
                <p className="text-3xl font-bold text-ice-white">77cm</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  -8cm cintura
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-aqua/10 to-aqua/5 border-aqua/20 hover:border-aqua/40 transition-all duration-300 aqua-glow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-aqua/20 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-aqua" />
              </div>
              <div>
                <p className="text-light-gray-text text-sm">Massa magra</p>
                <p className="text-3xl font-bold text-ice-white">52kg</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3kg ganho
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Human Body Measurements */}
      <HumanBodyMeasurements />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weight Evolution */}
        <Card className="bg-gradient-to-br from-light-gray to-light-gray/80 border-light-gray aqua-glow">
          <CardHeader>
            <CardTitle className="text-ice-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-aqua" />
              Evolução do Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockWeightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#36495C" />
                <XAxis 
                  dataKey="month" 
                  stroke="#AEBECD"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#AEBECD"
                  fontSize={12}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#2C3A4A',
                    border: '1px solid #36495C',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3DD9B3" 
                  strokeWidth={3}
                  dot={{ fill: '#3DD9B3', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Measurements */}
        <Card className="bg-gradient-to-br from-light-gray to-light-gray/80 border-light-gray aqua-glow">
          <CardHeader>
            <CardTitle className="text-ice-white flex items-center">
              <Ruler className="h-5 w-5 mr-2 text-aqua" />
              Medidas Corporais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockMeasurementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#36495C" />
                <XAxis 
                  dataKey="month" 
                  stroke="#AEBECD"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#AEBECD"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#2C3A4A',
                    border: '1px solid #36495C',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
                <Bar dataKey="chest" fill="#3DD9B3" name="Peitoral" />
                <Bar dataKey="waist" fill="#2BC0A0" name="Cintura" />
                <Bar dataKey="arm" fill="#AEBECD" name="Braço" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Photos Section */}
      <Card className="bg-gradient-to-br from-light-gray to-light-gray/80 border-light-gray aqua-glow">
        <CardHeader>
          <CardTitle className="text-ice-white">Fotos de Evolução</CardTitle>
          <p className="text-light-gray-text">Acompanhe o progresso visual do aluno</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-medium-blue-gray to-medium-blue-gray/80 rounded-xl flex flex-col items-center justify-center hover:from-medium-blue-gray/80 hover:to-medium-blue-gray/60 transition-all duration-300 hover-scale cursor-pointer border-2 border-dashed border-light-gray-text/30 hover:border-aqua/50">
                <div className="bg-aqua/20 p-3 rounded-full mb-2">
                  <svg className="h-6 w-6 text-aqua" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-light-gray-text text-sm text-center">
                  {i === 1 ? 'Foto Inicial' : i === 4 ? 'Foto Atual' : `Foto ${i}`}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
