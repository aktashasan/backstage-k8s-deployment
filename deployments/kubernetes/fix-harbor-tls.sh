#!/bin/bash
# Harbor TLS x509 "certificate signed by unknown authority" hatasını çözer
# OpenShift cluster'a Harbor CA sertifikasını ConfigMap üzerinden ekler

set -e
HARBOR_HOST="${HARBOR_HOST:-YOUR_HARBOR_HOST}"
HARBOR_NS="${HARBOR_NS:-harbor}"
TLS_SECRET="${TLS_SECRET:-harbor-ingress}"
CONFIGMAP_NAME="${CONFIGMAP_NAME:-harbor-registry-cas}"

echo "Harbor: $HARBOR_HOST | Secret: $HARBOR_NS/$TLS_SECRET"

# ca.crt'yi secret'tan al
oc get secret -n "$HARBOR_NS" "$TLS_SECRET" -o jsonpath='{.data.ca\.crt}' | base64 -d > /tmp/harbor-ca.pem
echo "CA cert alındı."

# ConfigMap oluştur (key = hostname, value = PEM cert)
# Port varsa: hostname..port formatı gerekir
oc create configmap "$CONFIGMAP_NAME" -n openshift-config \
  --from-file="${HARBOR_HOST}=/tmp/harbor-ca.pem" \
  --dry-run=client -o yaml | oc apply -f -

# Image config'e ConfigMap referansı ekle
oc patch image.config.openshift.io/cluster --type=merge -p '{"spec":{"additionalTrustedCA":{"name":"'${CONFIGMAP_NAME}'"}}}'

echo "Tamamlandı. Node'lar 2-5 dk içinde CA'yı yükler."
echo "Sonra: oc rollout restart deployment/backstage-backend -n backstage"
