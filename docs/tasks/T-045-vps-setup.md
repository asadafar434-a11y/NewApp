# T-045: VPS — базовая настройка

**Фаза:** 5 · **Оценка:** 4ч · **Зависит от:** T-044 · **Статус:** todo

## Цель
VPS готов к деплою: Docker, Caddy с TLS на доменах, firewall, пользователь deploy.

## Контекст
Шаги 1–4 из [08-infrastructure.md](../08-infrastructure.md#первый-деплой--по-шагам).
Провайдер — Timeweb Cloud (или Selectel), Ubuntu 24.04, 4 vCPU/8 ГБ.

## Что сделать
- [ ] Купить домен .ru; создать VPS; A-записи `app.` и `staging.` → IP
- [ ] SSH: пользователь `deploy` (sudo, ключ, вход по паролю выключен); UFW: allow 22, 80, 443
- [ ] Установить Docker + compose plugin; Caddy из официального apt-репо
- [ ] `/etc/caddy/Caddyfile` из 08-infrastructure.md (пока только статик-заглушка «скоро» — API появится в T-046)
- [ ] Каталоги `/opt/orbital/{staging,prod}/{web,}`; права deploy
- [ ] Обновления безопасности: `unattended-upgrades`

## Затрагиваемые файлы
- (вне репозитория — VPS; чек-лист хранить в этом файле)

## Критерии приёмки
- [ ] `https://app.ДОМЕН` и `https://staging.ДОМЕН` открываются с валидным TLS (заглушка)
- [ ] `ssh deploy@IP` по ключу работает; по паролю — нет
- [ ] `docker run hello-world` от deploy работает

## Как проверить
Браузер + ssh + `sudo ufw status`.

## Подводные камни
DNS-пропагация до пары часов — Caddy не получит сертификат, пока A-запись не разъедется;
сначала DNS, потом Caddy. Пользователь deploy в группе docker (без sudo для compose).
