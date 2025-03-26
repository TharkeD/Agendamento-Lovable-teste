
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Service } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/layout/PageTransition';
import { useServices } from '@/hooks/use-services';
import { ServiceCard } from '@/components/ui/service-card';

const Services = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(50);
  const { services, addService, updateService, deleteService } = useServices();
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do serviço é obrigatório.",
      });
      return;
    }
    
    if (editingService) {
      // Atualizar serviço existente
      updateService({
        ...editingService,
        name,
        duration,
        description,
        price
      });
      setEditingService(null);
    } else {
      // Adicionar novo serviço
      addService({
        name,
        duration,
        description,
        price
      });
    }
    
    // Limpar formulário
    setName('');
    setDuration(60);
    setDescription('');
    setPrice(50);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDuration(service.duration);
    setDescription(service.description);
    setPrice(service.price);
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setName('');
    setDuration(60);
    setDescription('');
    setPrice(50);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteService(id);
    }
  };

  // Função para formatar preço em Reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Serviços</h1>

          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-lg font-semibold">
                {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              {editingService ? (
                <>
                  <Button onClick={handleSubmit} variant="default">Salvar Alterações</Button>
                  <Button onClick={handleCancelEdit} variant="outline">Cancelar</Button>
                </>
              ) : (
                <Button onClick={handleSubmit}>Criar Serviço</Button>
              )}
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={() => handleDelete(service.id)}
                formatPrice={(price) => formatCurrency(price)}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Lista de Serviços</h2>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Uma lista dos seus serviços cadastrados.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Duração (min)</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.duration}</TableCell>
                      <TableCell className="text-right">{formatCurrency(service.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
};

export default Services;
