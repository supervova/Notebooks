1. Applications > xampp > etc > httpd.conf.

Внизу экрана находим
# Virtual hosts
#Include /Applications/xampp/etc/extra/httpd-vhosts.conf

Раскомментируем
# Virtual hosts
Include /Applications/xampp/etc/extra/httpd-vhosts.conf

Находим
User nobody

Меняем на 
User vova

2. Applications > xampp > etc > extra > httpd-vhosts.conf 

Добавляем внизу

(localhost нужен для доступа к phpmyadmin)
<VirtualHost *:80>
	ServerName localhost
	DocumentRoot "/Applications/xampp/htdocs"
	<Directory "/Applications/xampp/htdocs">
	Options Indexes FollowSymLinks Includes execCGI
	AllowOverride None
	Order Allow,Deny
	Allow From All
</Directory>
</VirtualHost>

<VirtualHost *:80>
	ServerName nickysheen.dev
	ServerAlias www.nickysheen.dev
	DocumentRoot "/Users/vova/Sites/homepage"
	<Directory "/Users/vova/Sites/homepage">
	Options Indexes FollowSymLinks Includes
	AllowOverride None
	Order allow,deny
	Allow from all
	</Directory>
	AddType application/x-httpd-php .php
	AddHandler application/x-httpd-php .php
	AddType text/html .htm
	AddHandler server-parsed .htm
	DirectoryIndex index.htm index.php
	ErrorLog "logs/nickysheen-error_log"
	CustomLog "logs/nickysheen-access_log" common
</VirtualHost>

(Чтобы в htm-файлах работали php-скрипты, надо заменить
	AddType application/x-httpd-php .php
	AddHandler application/x-httpd-php .php
	AddType text/html .htm
	AddHandler server-parsed .htm
на
	AddType application/x-httpd-php .php .htm
	AddHandler application/x-httpd-php .php .htm
Однако в этом случае не будут работать SSI. Их можно заменить php-инклудами
<?php require_once("/en/-inc/menu.inc"); ?>
Только есть опасения, что, как минимум, в Друпал-сайтах они не будут работать с путями от корня. В этом случае надо будет указывать относительные пути.
)

3. В файндере в меню "Переход" (Go) выбираем "Переход к папке" (Go to). Вводим /etc. Находим в папке файл hosts. Копируем его на рабочий стол (это важно для права на редакцию), там правим

добавляем внизу списка хостов (разделяя цифры и буквенный адрес табуляцией)
127.0.0.1 nickysheen.dev
127.0.0.1 www.nickysheen.dev
127.0.0.1 betplaynow.dev
127.0.0.1 www.betplaynow.dev
и т.д.

Закончив, переписываем файл обратно в папку etc

4. Для того, чтобы сайты были доступны в эмуляторе windows:

открываем настройки сети (на моем первом макбуке это обычно airport)
в правом верхнем углу настроек копируем ip-адрес

открываем
WINDOWS\system32\drivers\etc\hosts
и в конце файла добавляем нечто вроде:
192.168.1.7	www.nickysheen.dev
и т.д.

*****************************************
Если что-то не работает в верхнем меню параллель десктоп выбираем Virual Machine > Configure > Hardware > Network Adapter 1. Из списка Bridget Etherner выбираем то устройство, с помощью которого выходим в интернет в настоящий момент - например, airport
