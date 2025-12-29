# 📱 Guia Rápido de Teste Mobile

## 🎯 Objetivo

Validar as melhorias mobile-first implementadas nas páginas **CONTATO** e **SOBRE**.

---

## 🔧 Preparação

### DevTools do Chrome
1. Abra DevTools (F12)
2. Clique no ícone de dispositivo móvel (Ctrl+Shift+M)
3. Selecione o dispositivo no dropdown

### Dispositivos Reais
- Use seu smartphone físico
- Conecte via USB e use o Chrome Remote Debugging
- Ou acesse via rede local (IP do computador)

---

## 📋 Roteiro de Testes

### 🔷 PÁGINA CONTATO (`/contato`)

#### 1. Hero Section (Mobile)
**Dispositivo**: iPhone SE (375px)

✅ **Verificar**:
- [ ] Título legível e bem espaçado
- [ ] Subtítulo não quebra de forma estranha
- [ ] Altura adequada (não muito alta/baixa)
- [ ] Gradiente de fundo visível

**Resultado Esperado**: Hero compacto mas impactante, texto centralizado e legível.

---

#### 2. Botões de Ação Rápida
**Dispositivo**: Qualquer mobile

✅ **Verificar**:
- [ ] Botões empilhados verticalmente
- [ ] Fácil de tocar (≥ 44px)
- [ ] Texto "Falar no WhatsApp" visível em mobile
- [ ] Sombras visíveis
- [ ] Feedback visual ao tocar

**Teste**:
1. Toque no botão WhatsApp
2. Deve abrir o WhatsApp com mensagem pré-preenchida
3. Toque no botão de telefone
4. Deve iniciar ligação

---

#### 3. Formulário de Contato - Etapa 1
**Dispositivo**: iPhone 12 (390px)

✅ **Verificar**:
- [ ] Indicador de progresso visível (1/2)
- [ ] 4 botões de intenção em grade 2x2
- [ ] Ícones grandes e visíveis
- [ ] Fácil de tocar cada opção
- [ ] Feedback visual ao selecionar

**Teste**:
1. Toque em "Comprar"
2. Botão deve ficar azul com sombra
3. Campos de contato aparecem abaixo
4. Preencha Nome, E-mail, WhatsApp
5. Selecione preferência de contato
6. Toque em "Continuar"
7. Deve avançar para Etapa 2

---

#### 4. Formulário de Contato - Etapa 2
**Dispositivo**: Samsung Galaxy S21 (360px)

✅ **Verificar**:
- [ ] Indicador mostra 2/2
- [ ] Botão "Voltar" visível no canto superior direito
- [ ] Campos condicionais aparecem conforme intenção
- [ ] Checkboxes grandes e fáceis de marcar
- [ ] Botões de ação empilhados (Enviar acima, Voltar abaixo)
- [ ] Botão "Enviar" destaca-se visualmente

**Teste**:
1. Preencha os campos adicionais
2. Marque o checkbox obrigatório
3. Toque em "Enviar mensagem"
4. Mensagem de sucesso deve aparecer
5. Toque em "Voltar" (antes de enviar)
6. Deve retornar à Etapa 1 sem perder dados

---

#### 5. Sidebar de Contato - Tab "Contato"
**Dispositivo**: iPhone 14 Pro Max (430px)

✅ **Verificar**:
- [ ] 3 tabs visíveis horizontalmente
- [ ] Tab ativa tem linha azul embaixo
- [ ] Card de "Tempo de resposta" destaca-se
- [ ] Status "Aberto agora" aparece (se dentro do horário)
- [ ] Informações de endereço legíveis
- [ ] Botão "Como chegar" grande e azul
- [ ] Horários e CRECI legíveis

**Teste**:
1. Toque em "Como chegar"
2. Deve abrir Google Maps com endereço
3. Toque nos telefones/e-mail
4. Devem iniciar ações correspondentes

---

#### 6. Sidebar de Contato - Tab "Equipe"
**Dispositivo**: Qualquer mobile

✅ **Verificar**:
- [ ] Campo de busca com altura adequada (≥ 44px)
- [ ] Lista de corretores com fotos
- [ ] Botões WhatsApp verdes e redondos
- [ ] Fácil de tocar cada botão (≥ 44px)
- [ ] Scroll vertical suave na lista

**Teste**:
1. Digite um nome no campo de busca
2. Lista deve filtrar em tempo real
3. Toque no botão WhatsApp de um corretor
4. Deve abrir WhatsApp com mensagem personalizada

---

#### 7. Sidebar de Contato - Tab "FAQ"
**Dispositivo**: Qualquer mobile

✅ **Verificar**:
- [ ] Acordeões fechados por padrão
- [ ] Fácil de expandir/colapsar
- [ ] Texto legível dentro dos acordeões
- [ ] Link "Falar no WhatsApp" visível

**Teste**:
1. Toque em uma pergunta
2. Resposta deve expandir suavemente
3. Toque novamente
4. Resposta deve colapsar
5. Toque em "Falar no WhatsApp"
6. Deve abrir WhatsApp

---

### 🔶 PÁGINA SOBRE (`/sobre`)

#### 8. Hero Section Premium
**Dispositivo**: iPhone SE (375px)

✅ **Verificar**:
- [ ] Imagem de fundo carrega e cobre toda área
- [ ] Badge "Excelência em Alto Padrão" visível
- [ ] Título em 3 linhas legíveis
- [ ] Overlay escuro sobre imagem (legibilidade)
- [ ] Altura adequada (não muito alta)

**Resultado Esperado**: Hero impactante, texto branco legível sobre imagem escurecida.

---

#### 9. Estatísticas Animadas
**Dispositivo**: Qualquer mobile

✅ **Verificar**:
- [ ] Grade 2x3 em mobile (2 colunas)
- [ ] Cards brancos com sombra sutil
- [ ] Números grandes e legíveis
- [ ] Animação de contagem ao rolar
- [ ] Labels em 2 linhas quando necessário

**Teste**:
1. Role até a seção de estatísticas
2. Números devem animar de 0 até valor final
3. Animação deve ser suave (2.5s)

---

#### 10. Nossa História
**Dispositivo**: iPad Mini (768px)

✅ **Verificar**:
- [ ] Texto aparece ANTES da imagem em mobile
- [ ] Imagem tem altura adequada
- [ ] Texto legível e bem espaçado
- [ ] Linha decorativa dourada antes do título

**Resultado Esperado**: Conteúdo prioritário (texto) carrega primeiro, imagem abaixo.

---

#### 11. Missão, Visão e Valores
**Dispositivo**: Qualquer mobile

✅ **Verificar**:
- [ ] 3 tabs na horizontal com ícones
- [ ] Fácil de tocar cada tab (≥ 44px)
- [ ] Tab ativa fica azul
- [ ] Conteúdo troca suavemente
- [ ] Ícone grande no card
- [ ] Texto legível

**Teste**:
1. Toque em "Missão"
2. Conteúdo deve aparecer com animação
3. Toque em "Visão"
4. Conteúdo deve trocar suavemente
5. Toque em "Valores"
6. Mesmo comportamento

---

#### 12. Call-to-Action Final
**Dispositivo**: Qualquer mobile

✅ **Verificar**:
- [ ] Fundo azul escuro com gradiente sutil
- [ ] Título branco legível
- [ ] 2 botões empilhados verticalmente
- [ ] Botão "Ver Imóveis" branco destaca-se
- [ ] Botão "Falar com Corretor" translúcido
- [ ] Trust badge (CRECI, CNPJ) legível

**Teste**:
1. Toque em "Ver Imóveis"
2. Deve navegar para /imoveis
3. Volte e toque em "Falar com Corretor"
4. Deve navegar para /contato

---

## 🧪 Testes de Acessibilidade

### Navegação por Teclado (Desktop)
**Dispositivo**: Desktop

1. Abra `/contato` ou `/sobre`
2. Pressione Tab repetidamente
3. ✅ **Verificar**:
   - [ ] Foco visível em todos os elementos
   - [ ] Ordem lógica de navegação
   - [ ] Possível preencher formulário inteiro com teclado
   - [ ] Enter ativa botões e links

---

### Leitor de Tela (Mobile)
**Dispositivo**: iPhone com VoiceOver ou Android com TalkBack

1. Ative o leitor de tela
2. Navegue pela página
3. ✅ **Verificar**:
   - [ ] Títulos são anunciados corretamente
   - [ ] Botões têm labels descritivos
   - [ ] Inputs têm labels associados
   - [ ] Status de aberto/fechado é anunciado
   - [ ] Tabs anunciam posição (1 de 3, etc)

---

### Zoom 200%
**Dispositivo**: Qualquer

1. Use zoom do navegador (Ctrl + +)
2. Aumente até 200%
3. ✅ **Verificar**:
   - [ ] Sem scroll horizontal
   - [ ] Texto permanece legível
   - [ ] Botões permanecem clicáveis
   - [ ] Layout não quebra

---

## 📊 Checklist de Validação Rápida

### ✅ Página CONTATO
- [ ] Hero responsivo
- [ ] Botões de ação rápida funcionam
- [ ] Formulário - Etapa 1 completa
- [ ] Formulário - Etapa 2 completa
- [ ] Formulário - Envio com sucesso
- [ ] Sidebar - Tab Contato
- [ ] Sidebar - Tab Equipe
- [ ] Sidebar - Tab FAQ
- [ ] Todos os links externos abrem
- [ ] Validação de campos funciona

### ✅ Página SOBRE
- [ ] Hero premium carrega
- [ ] Estatísticas animam
- [ ] Seção História legível
- [ ] Tabs Missão/Visão/Valores funcionam
- [ ] Lazy loading de seções
- [ ] CTA final funciona
- [ ] Todos os botões redirecionam

### ✅ Acessibilidade
- [ ] Navegação por teclado
- [ ] Touch targets ≥ 44px
- [ ] Contraste adequado
- [ ] ARIA labels presentes
- [ ] Zoom 200% sem quebras
- [ ] Leitor de tela funcional

---

## 🐛 Como Reportar Problemas

Se encontrar algum problema, documente:

1. **Dispositivo**: Nome e resolução
2. **Navegador**: Chrome/Safari/Firefox + versão
3. **Página**: /contato ou /sobre
4. **Seção**: Qual parte específica
5. **Problema**: Descrição detalhada
6. **Screenshot**: Se possível
7. **Passos para reproduzir**: Lista numerada

**Exemplo**:
```
Dispositivo: iPhone 12 (390x844)
Navegador: Safari 17.2
Página: /contato
Seção: Formulário de Contato
Problema: Botão "Continuar" fica cortado em landscape
Screenshot: [anexo]
Passos:
1. Abra /contato
2. Gire dispositivo para landscape
3. Selecione uma intenção
4. Role até botão "Continuar"
5. Botão aparece cortado
```

---

## ✨ Critérios de Sucesso

Uma página passa no teste se:

- ✅ **100% funcional** em todos os dispositivos testados
- ✅ **Touch targets** todos ≥ 44x44px
- ✅ **Texto legível** sem zoom (mínimo 14px)
- ✅ **Sem scroll horizontal** em nenhuma resolução
- ✅ **Animações suaves** sem travamentos
- ✅ **Acessível** por teclado e leitor de tela
- ✅ **Feedback visual** em todas as interações
- ✅ **Sem erros** no console do navegador

---

## 🎉 Conclusão

Após completar todos os testes, ambas as páginas devem proporcionar uma **experiência premium e acessível** em todos os dispositivos móveis!

**Status Esperado**: ✅ 100% Aprovado

---

**Última Atualização**: 29/12/2025  
**Versão**: 1.0  
**Próxima Revisão**: Após feedback dos usuários

