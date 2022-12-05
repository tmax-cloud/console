---
layout: default
title: HyperCloud 5.1
description: >-
  HyperCloud 5.1 콘솔 프로젝트입니다.
---

# ⛅ HyperCloud Console Project

- Console 설치 가이드 - [link](https://github.com/tmax-cloud/install-console)

<br/>

---

# 📚 사용자 가이드 리스트

- ### [Console YAML Samples 사용 가이드]({{'/page-consoleYAMLsamples' | relative_url}})
- ### [Cluster Menu Policy 사용 가이드]({{'/page-clustermenupolicy' | relative_url}})
<br/>

---

<!-- # 🧐 메뉴 담당자

<div class="menuHandlerTable-container">
<div class="inner-vertical-container">
<h2>Master Menu</h2>
<table class="inline-table">
  {% for row in site.data.masterMenu %}
    {% if forloop.first %}
    <tr>
      {% for pair in row %}
        <th>{{ pair[0] }}</th>
      {% endfor %}
    </tr>
    {% endif %}

    {% tablerow pair in row %}
      {{ pair[1] }}
    {% endtablerow %}

{% endfor %}

</table>

<h2>Multi Cluster Menu</h2>
<table class="inline-table">
  {% for row in site.data.multiMenu %}
    {% if forloop.first %}
    <tr>
      {% for pair in row %}
        <th>{{ pair[0] }}</th>
      {% endfor %}
    </tr>
    {% endif %}

    {% tablerow pair in row %}
      {{ pair[1] }}
    {% endtablerow %}

{% endfor %}

</table>
</div>

<div class="inner-vertical-container">
<h2>Developer Menu</h2>
<table class="inline-table">
  {% for row in site.data.developerMenu %}
    {% if forloop.first %}
    <tr>
      {% for pair in row %}
        <th>{{ pair[0] }}</th>
      {% endfor %}
    </tr>
    {% endif %}

    {% tablerow pair in row %}
      {{ pair[1] }}
    {% endtablerow %}

{% endfor %}

</table>
</div>

</div>

<br/>
--- -->

# 🖥️ 개발 가이드 리스트

- openshift console 코드 원본 - [github](https://github.com/openshift/console/tree/release-4.5)
- 메인 작업은 **master** Branch에서 진행 됩니다.

- ### [(WSL2) Linux 개발환경 구축 가이드]({{'/page-wsl' | relative_url}})
- ### [Helm 가이드]({{'/page-helm' | relative_url}})
